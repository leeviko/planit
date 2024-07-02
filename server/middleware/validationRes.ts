import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const validationRes = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json(result.mapped());
  }

  next();
};
