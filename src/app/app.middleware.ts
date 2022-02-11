import { NextFunction, Request, Response } from 'express';
import { sessionUser } from '../utils/session';

export async function sessionValidator(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await sessionUser(req); // ensure the session is correct
  next();
}
