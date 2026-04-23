import { AuthTokenPayload } from "../types/auth.type.js";

declare global {
  namespace Express {
    interface Request {
      user: AuthTokenPayload;
    }
  }
}