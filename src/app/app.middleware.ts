import { NextFunction } from 'express';
import { Communication, Status } from '../utils/communication';
import { getConnection, MoreThan } from 'typeorm';
import { Session } from '../user/user.entity';

export async function sessionValidator(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sessionId = req.headers['session-identifier'];
  const sessionRepo = getConnection().getRepository(Session);
  const session = await sessionRepo.findOne({
    where: { id: sessionId, expire: MoreThan(Date.now()) },
  });
  if (session === undefined) {
    throw Communication.err(Status.ERROR_INVALID_SESSION, 'Invalid session.');
  }
  next();
}
