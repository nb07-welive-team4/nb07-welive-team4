import { Router } from "express";
import * as apartmentController from "../controllers/apartment.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// 공개용 (인증 불필요)
router.get("/public", apartmentController.getApartmentsPublic);
router.get("/public/:id", apartmentController.getApartmentPublicById);

// 관리자 전용 (인증 필요)
// TODO: 인증 담당자 코드 연동 후 아래 주석 해제, 임시 라우터 제거
// router.get("/", authenticate, requireRole("ADMIN", "SUPER_ADMIN"), apartmentController.getApartments);
// router.get("/:id", authenticate, requireRole("ADMIN", "SUPER_ADMIN"), apartmentController.getApartmentById);

// 임시 (인증 미연동)
router.get("/", apartmentController.getApartments);
router.get("/:id", apartmentController.getApartmentById);

export default router;