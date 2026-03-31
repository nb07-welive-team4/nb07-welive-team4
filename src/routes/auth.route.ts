import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/signup", authController.createUser);
authRouter.post("/signup/admin", authController.createAdmin);
authRouter.post("/signup/super-admin", authController.createSuperAdmin);

export default authRouter;
