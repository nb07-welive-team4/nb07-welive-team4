import bcrypt from "bcrypt";
import prisma, { pool } from "../src/lib/prisma";

async function main() {
  console.log("데이터베이스 시딩을 시작합니다...");

  // 최고 관리자 정보 설정 (환경 변수 우선, 없으면 기본값 사용)
  const superAdminUsername = process.env.SUPER_ADMIN_USERNAME || "superadmin";
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "password123!";
  const superAdminName = process.env.SUPER_ADMIN_NAME || "최고관리자";
  const superAdminContact = process.env.SUPER_ADMIN_CONTACT || "01099990000";
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "superadmin@seed.com";

  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  // super admin 생성
  const superAdmin = await prisma.user.upsert({
    where: { username: superAdminUsername },
    update: {},
    create: {
      username: superAdminUsername,
      password: hashedPassword,
      name: superAdminName,
      contact: superAdminContact,
      email: superAdminEmail,
      role: "SUPER_ADMIN",
      joinStatus: "APPROVED",
    },
  });
  console.log(`✅ SUPER_ADMIN 생성 완료: ${superAdmin.username}`);

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
