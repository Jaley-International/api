import { NextFunction, Request, Response } from 'express';
import { getSessionUser } from '../utils/session';
import { checkUserPrivileges } from '../utils/authorization';

export async function sessionValidator(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await getSessionUser(req); // ensure the session is correct
  next();
}

export async function privilegeValidator(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const curUser = await getSessionUser(req);
  await checkUserPrivileges(curUser);
  next();
}
