import { Request, Response, NextFunction } from "express";
import { Struct, validate } from "superstruct";

export const validateData = <T>(struct: Struct<T>, target: "body" | "query" | "params" = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const [err, validated] = validate(req[target], struct);

    if (err) {
      return next(err);
    }

    (req as any)[target] = validated;

    next();
  };
};
