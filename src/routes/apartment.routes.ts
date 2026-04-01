import { Router } from "express";
import * as apartmentController from "../controllers/apartment.controller";

const router = Router();

// 공개용 (인증 불필요)
router.get("/public", apartmentController.getApartmentsPublic);
router.get("/public/:id", apartmentController.getApartmentPublicById);

// 관리자 전용 (인증 필요)
// TODO: 권한 체크 미들웨어 추가 필요
router.get("/", authMiddleware, apartmentController.getApartments);
router.get("/:id", authMiddleware, apartmentController.getApartmentById);

export default router;