import { Request, Response, NextFunction } from "express";
import { create, Struct } from "superstruct";

export const validateData = <T, S>(struct: Struct<T>, target: "body" | "query" | "params" = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = create(req[target], struct);

      Object.assign(req[target] as object, validated as object);

      next();
    } catch (err) {
      next(err);
    }
  };
};
