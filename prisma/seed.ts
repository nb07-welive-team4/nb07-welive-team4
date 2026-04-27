import bcrypt from "bcrypt";
import prisma, { pool } from "../src/lib/prisma";

async function main() {
  console.log("🌱 데이터베이스 시딩을 시작합니다...");

  // 공통 비밀번호 해싱 ("password123!")
  const hashedPassword = await bcrypt.hash("password123!", 10);

  // 1. 최고 관리자 (SUPER_ADMIN) 생성
  const superAdmin = await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {}, // 이미 존재하면 아무 작업도 하지 않음
    create: {
      username: "superadmin",
      password: hashedPassword,
      name: "최고관리자",
      contact: "01000000000",
      email: "super@test.com",
      role: "SUPER_ADMIN",
      joinStatus: "APPROVED",
    },
  });
  console.log(`✅ SUPER_ADMIN 생성 완료: ${superAdmin.username}`);

  // 2. 아파트 관리자 (ADMIN) 계정 생성
  const adminUser = await prisma.user.upsert({
    where: { username: "adminuser1" },
    update: {},
    create: {
      username: "adminuser1",
      password: hashedPassword,
      name: "관리자김",
      contact: "01098765432",
      email: "admin1@example.com",
      role: "ADMIN",
      joinStatus: "APPROVED",
    },
  });
  console.log(`✅ ADMIN 생성 완료: ${adminUser.username}`);

  // 3. 테스트용 아파트 및 기본 게시판 생성 (그리고 위에서 만든 ADMIN과 연결)
  let apartment = await prisma.apartment.findFirst({
    where: { name: "테스트아파트" },
  });

  if (!apartment) {
    apartment = await prisma.apartment.create({
      data: {
        name: "테스트아파트",
        address: "서울시 강남구 테스트로 1",
        officeNumber: "02-1234-5678",
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
        // 아파트와 관리자 계정 연결
        admin: {
          connect: { id: adminUser.id },
        },
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
  }

  console.log("🎉 시딩 작업이 모두 완료되었습니다!");
}

main()
  .catch((e) => {
    console.error("❌ 시딩 중 오류 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (pool) await pool.end();
  });
