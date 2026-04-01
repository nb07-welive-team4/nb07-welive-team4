import { createUser, createAdmin, createSuperAdmin, loginData } from "../structs/auth.struct";
import { AuthRepo } from "../repositories/auth.repository";
import { ApartRepo } from "../repositories/apartment.repository";
import { NotFoundError, UnauthorizedError } from "../errors/errors";
import { LoginResponseDto } from "../models/auth.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken, expiresIn14Days } from "../utils/auth.utill";
import prisma from "../lib/prisma";

export class AuthService {
  private authRepo = new AuthRepo();
  private apartRepo = new ApartRepo();

  /**
   * ? ì?????• (USER, ADMIN, SUPER_ADMIN)???°ë¼ ì°¨ë³„?”ëœ ?Œì›ê°€??ë¡œì§???˜í–‰
   * @param data - ?Œì›ê°€?…ì— ?„ìš”???°ì´??ê°ì²´
   * @throws {NotFoundError} ?„íŒŒ???•ë³´ê°€ DB???†ì„ ê²½ìš° ë°œìƒ (USER ê¶Œí•œ ê°€????
   * @returns ê°€???„ë£Œ??? ì? ?•ë³´
   */
  register = async (data: createUser | createAdmin | createSuperAdmin) => {
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRound);

    const commonData = {
      username: data.username,
      password: hashedPassword,
      contact: data.contact,
      name: data.name,
      email: data.email,
    };

    // ?¼ë°˜ ? ì? ê°€??ë¡œì§
    if (data.role === "USER") {
      const apartmentId = await this.apartRepo.getApartmentId(data.apartmentName);
      if (!apartmentId) {
        throw new NotFoundError(`?´ë‹¹ ?„íŒŒ?¸ê? ì¡´ì¬?˜ì? ?ŠìŠµ?ˆë‹¤.`);
      }

      const user = await this.authRepo.createUser({
        ...commonData,
        role: "USER",
        residentApartmentId: apartmentId.id,
        apartmentName: data.apartmentName,
        apartmentDong: data.apartmentDong,
        apartmentHo: data.apartmentHo,
      });

      return user;
    }

    // ?„íŒŒ??ê´€ë¦¬ì(ADMIN) ê°€??ë¡œì§ (?„íŒŒ???•ë³´ ?™ì‹œ???ì„±)
    if (data.role === "ADMIN") {
      return await prisma.$transaction(async (tx) => {
        // ê´€ë¦¬ì ê³„ì • ?ì„±
        const createdAdmin = await this.authRepo.createUser(
          {
            ...commonData,
            role: "ADMIN",
          },
          tx,
        );

        // ?´ë‹¹ ê´€ë¦¬ìê°€ ê´€ë¦¬í•˜???„íŒŒ???ì„±
        const createdApartment = await this.apartRepo.createApart(
          {
            name: data.apartmentName,
            address: data.apartmentAddress,
            officeNumber: data.apartmentManagementNumber,
            description: data.description,
            startComplexNumber: data.startComplexNumber,
            endComplexNumber: data.endComplexNumber,
            startDongNumber: data.startDongNumber,
            endDongNumber: data.endDongNumber,
            startFloorNumber: data.startFloorNumber,
            endFloorNumber: data.endFloorNumber,
            startHoNumber: data.startHoNumber,
            endHoNumber: data.endHoNumber,
            adminId: createdAdmin.id,
          },
          tx,
        );

        // ?ì„±???„íŒŒ??IDë¥?ê´€ë¦¬ì ê³„ì •???…ë°?´íŠ¸
        await this.authRepo.updateUser(createdAdmin.id, createdApartment.id, tx);

        return createdAdmin;
      });
    }

    // ?œìŠ¤???µí•© ê´€ë¦¬ì(SUPER_ADMIN) ê°€??ë¡œì§
    if (data.role === "SUPER_ADMIN") {
      const superAdmin = await this.authRepo.createUser({
        ...commonData,
        role: "SUPER_ADMIN",
        joinStatus: data.joinStatus,
      });

      return superAdmin;
    }
  };

  /**
   * ?¬ìš©??ë¡œê·¸?¸ì„ ì²˜ë¦¬?˜ê³  ?ˆë¡œ??Access/Refresh ? í° ?¸íŠ¸ë¥?ë°œê¸‰
   * @param data - ë¡œê·¸???…ë ¥ ?°ì´??(username, password)
   * @throws {UnauthorizedError} ?„ì´?”ê? ?†ê±°??ë¹„ë?ë²ˆí˜¸ê°€ ?€ë¦?ê²½ìš° ë°œìƒ
   */
  login = async (data: loginData) => {
    const user = await this.authRepo.findByUsername(data.username);
    if (!user) {
      throw new UnauthorizedError("?„ì´???ëŠ” ë¹„ë?ë²ˆí˜¸ê°€ ?¼ì¹˜?˜ì? ?ŠìŠµ?ˆë‹¤.");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("?„ì´???ëŠ” ë¹„ë?ë²ˆí˜¸ê°€ ?¼ì¹˜?˜ì? ?ŠìŠµ?ˆë‹¤.");
    }

    // ? í° ë°œê¸‰ ë°?ê¸°ì¡´ ? í° ?•ë¦¬
    const { accessToken, refreshToken } = await this.rotateTokens({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const userResponse = new LoginResponseDto(user);
    return { user: userResponse, accessToken, refreshToken };
  };

  /**
   * ? íš¨??Refresh ? í°???•ì¸?˜ê³  Access/Refresh ? í°???¬ë°œê¸?
   * @param token - ?´ë¼?´ì–¸?¸ë¡œë¶€???„ë‹¬ë°›ì? Refresh Token
   * @throws {UnauthorizedError} ? í°??? íš¨?˜ì? ?Šê±°??ë§Œë£Œ??ê²½ìš° ë°œìƒ
   */
  refresh = async (token: string) => {
    // ? í° ? íš¨??ê²€??
    await verifyToken(token, process.env.JWT_REFRESH_SECRET!);

    // DB???€?¥ëœ ? í°?¸ì? ?•ì¸ ë°?ë§Œë£Œ ?¬ë? ì²´í¬
    const savedToken = await this.authRepo.findRefreshToken(token);
    if (!savedToken || savedToken.expiresAt < new Date()) {
      throw new UnauthorizedError("? íš¨?˜ì? ?Šê±°??ë§Œë£Œ???¸ì…˜?…ë‹ˆ??");
    }

    const user = savedToken.user;

    return await this.rotateTokens(user);
  };

  /**
   * ê¸°ì¡´ ? í°??ëª¨ë‘ ?? œ?˜ê³  ?ˆë¡œ??? í° ?¸íŠ¸ë¥?DB???€????ë°˜í™˜(ë¡œê·¸???¬ë°œê¸????¬ìš©)
   * @param user - ? í°???´ê¸¸ ? ì? ?•ë³´ ?˜ì´ë¡œë“œ
   * @private
   */
  private rotateTokens = async (user: { id: string; username: string; role: string }) => {
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "14d" },
    );

    const newExpiresAt = expiresIn14Days();

    // ê¸°ì¡´ ? í° ëª¨ë‘ ?? œ ????? í° ?€??(?¸ëœ??…˜ ?¬ìš©)
    await prisma.$transaction(async (tx) => {
      await this.authRepo.deleteAllRefreshTokens(user.id, tx);
      await this.authRepo.saveRefreshToken(user.id, refreshToken, newExpiresAt, tx);
    });

    return { accessToken, refreshToken };
  };

  /**
   * ?¹ì • ?¬ìš©?ì˜ ë¦¬í”„?ˆì‹œ ? í°??DB?ì„œ ?? œ?˜ì—¬ ë¡œê·¸?„ì›ƒ ì²˜ë¦¬?©ë‹ˆ??
   * @param userId - ë¡œê·¸?„ì›ƒ???œë„?˜ëŠ” ? ì? ID
   * @param refreshToken - ë¬´íš¨?”í•  ?¹ì • ë¦¬í”„?ˆì‹œ ? í°
   */
  logout = async (userId: string, refreshToken: string): Promise<void> => {
    const isDeleted = await this.authRepo.deleteRefreshTokens(userId, refreshToken);

    if (!isDeleted) {
      throw new UnauthorizedError("?´ë? ë¡œê·¸?„ì›ƒ?˜ì—ˆê±°ë‚˜ ? íš¨?˜ì? ?Šì? ?¸ì…˜?…ë‹ˆ??");
    }
  };
}
