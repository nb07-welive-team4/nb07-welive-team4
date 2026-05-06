import bcrypt from "bcrypt";
import prisma, { pool } from "../src/lib/prisma";

async function main() {
  console.log("🌱 데이터베이스 시딩을 시작합니다...");

  // 공통 비밀번호 해싱
  const hashedPassword = await bcrypt.hash("password123!", 10);

  // 시딩용 고유 연락처/이메일 (기존 데이터와 Unique 제약조건 충돌 방지)
  const SUPER_ADMIN_CONTACT = "01099990000";
  const ADMIN_CONTACT = "01099990001";
  const USER_CONTACT = "01099990002";

  // 1. 최고 관리자 (SUPER_ADMIN) 생성
  const superAdmin = await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      password: hashedPassword,
      name: "최고관리자",
      contact: SUPER_ADMIN_CONTACT,
      email: "superadmin@seed.com",
      role: "SUPER_ADMIN",
      joinStatus: "APPROVED",
    },
  });
  console.log(`✅ SUPER_ADMIN 생성 완료: ${superAdmin.username}`);

  // 2. 테스트용 아파트 및 기본 게시판 생성
  let apartment = await prisma.apartment.findFirst({
    where: { name: "테스트아파트" },
  });

  if (!apartment) {
    apartment = await prisma.apartment.create({
      data: {
        name: "테스트아파트",
        address: "서울시 강남구 테스트로 1",
        officeNumber: "0212345678", // 💡 하이픈(-) 제거 정책 반영
        description: "테스트용 아파트입니다.",
        startComplexNumber: "1",
        endComplexNumber: "5",
        startDongNumber: "101",
        endDongNumber: "105",
        startFloorNumber: "1",
        endFloorNumber: "20",
        startHoNumber: "101",
        endHoNumber: "120",
        apartmentStatus: "APPROVED",
        // 기본 게시판 생성 (apartment.repository.ts 로직 참고)
        boards: {
          create: [
            { name: "공지게시판", type: "NOTICE" },
            { name: "투표게시판", type: "POLL" },
            { name: "민원게시판", type: "COMPLAINT" },
          ],
        },
      },
    });
    console.log(`✅ 아파트 및 기본 게시판 생성 완료: ${apartment.name}`);
  } else {
    console.log(`✅ 기존 아파트 사용: ${apartment.name}`);
  }

  // 3. 아파트 관리자 (ADMIN) 계정 생성 및 아파트 연결
  // 💡 다른 테스트에서 '테스트아파트'를 참조했을 경우 Unique 제약조건 충돌을 방지하기 위해 기존 연결 해제
  await prisma.user.updateMany({
    where: {
      apartmentId: apartment.id,
      username: { not: "adminuser1" },
    },
    data: { apartmentId: null },
  });

  const adminUser = await prisma.user.upsert({
    where: { username: "adminuser1" },
    update: {
      apartmentId: apartment.id,
    },
    create: {
      username: "adminuser1",
      password: hashedPassword,
      name: "관리자김",
      contact: ADMIN_CONTACT,
      email: "admin1@seed.com",
      role: "ADMIN",
      joinStatus: "APPROVED",
      apartmentId: apartment.id,
    },
  });
  console.log(`✅ ADMIN 생성 완료: ${adminUser.username}`);

  // 4. 생성된 관리자(User)를 아파트의 admin(adminId)으로 역방향 연결 업데이트
  await prisma.apartment.update({
    where: { id: apartment.id },
    data: {
      admin: { connect: { id: adminUser.id } },
    },
  });
  console.log(`✅ 아파트-관리자 연결 업데이트 완료`);

  // 5. 일반 주민 (USER) 및 Resident 생성
  let resident = await prisma.resident.findFirst({
    where: { contact: USER_CONTACT },
  });

  if (!resident) {
    resident = await prisma.resident.create({
      data: {
        apartmentId: apartment.id,
        building: "101",
        unitNumber: "101",
        name: "일반주민",
        contact: USER_CONTACT,
        isHouseholder: "HOUSEHOLDER",
        isRegistered: true,
        residenceStatus: "RESIDENCE",
      },
    });
    console.log(`✅ 입주민 명부(Resident) 생성 완료: ${resident.name}`);
  } else {
    console.log(`✅ 기존 입주민 명부(Resident) 사용: ${resident.name}`);
  }

  // 💡 residentId 역시 1:1 관계일 수 있으므로 Unique 제약조건 충돌 방지
  await prisma.user.updateMany({
    where: {
      residentId: resident.id,
      username: { not: "normaluser1" },
    },
    data: { residentId: null },
  });

  const normalUser = await prisma.user.upsert({
    where: { username: "normaluser1" },
    update: { residentId: resident.id },
    create: {
      username: "normaluser1",
      password: hashedPassword,
      name: "일반주민",
      contact: USER_CONTACT,
      email: "user1@seed.com",
      role: "USER",
      joinStatus: "APPROVED",
      residentId: resident.id,
      apartmentName: apartment.name,
      apartmentDong: "101",
      apartmentHo: "101",
    },
  });
  console.log(`✅ 일반 주민(USER) 생성 완료: ${normalUser.username}`);

  console.log("🎉 시딩 작업이 모두 완료되었습니다!");
}

main()
  .catch((e) => {
    console.error("❌ 시딩 중 오류 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (typeof pool !== "undefined" && pool.end) {
      await pool.end();
    }
  });
