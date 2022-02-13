import { NextFunction, Request, Response } from 'express';
import { getSessionUser } from '../utils/session';

export async function sessionValidator(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await getSessionUser(req); // ensure the session is correct
  next();
}
