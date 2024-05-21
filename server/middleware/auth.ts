import { NextFunction, Request, Response } from 'express';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  next();
};
