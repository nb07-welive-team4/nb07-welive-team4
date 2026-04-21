import { Request, Response } from "express";
import { UpdateProfileDto, ValidatePassword } from "../structs/user.struct";
import { UserService } from "../services/user.service";

export class UserController {
  private userService = new UserService();

  /**
   * 유저 프로필 정보 수정 요청 처리 (PATCH /me)
   * 인증 미들웨어를 통해 주입된 유저 ID와 멀터(Multer)를 통해 수신된 파일을 서비스로 전달
   * @param req - Request 객체 (body: UpdateProfileDto, file: Express.Multer.File)
   * @param res - Response 객체
   */
  updateProfile = async (req: Request<{}, {}, UpdateProfileDto>, res: Response) => {
    const userId = req.user.id;
    const file = req.file;
    const result = await this.userService.updateProfile(userId, req.body, file);
    res.status(200).json(result);
  };

  /**
   * 유저 비밀번호 변경 요청 처리 (PATCH /password)
   * 현재 비밀번호와 새 비밀번호를 검증하여 계정 보안 정보를 업데이트
   * @param req - Request 객체 (body: ValidatePassword)
   * @param res - Response 객체
   */
  changePassword = async (req: Request<{}, {}, ValidatePassword>, res: Response) => {
    const userId = req.user.id;
    const result = await this.userService.changePassword(userId, req.body);
    res.status(200).json(result);
  };
}
