<<<<<<< HEAD
import { Role } from "../generated/prisma";
=======
import { AuthTokenPayload } from "../types/auth.type";
>>>>>>> develop

declare global {
  namespace Express {
    interface Request {
<<<<<<< HEAD
      user: {
        id: number;
        role: Role;
      };
=======
      user: AuthTokenPayload;
>>>>>>> develop
    }
  }
}
