import { NextFunction, Request, Response } from 'express';
import { Communication, Status } from '../utils/communication';
import { getConnection, MoreThan } from 'typeorm';
import { Session } from '../user/user.entity';

export async function sessionValidator(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sessionRepo = getConnection().getRepository(Session);
  const authHeader = req.header('authorization');

  if (!authHeader) {
    throw Communication.err(
      Status.ERROR_NO_AUTH_TOKEN,
      'Header does not contain any authorization field.',
    );
  }

  // getting the token from the string
  const bearerToken = authHeader.split(' ');
  const token = bearerToken[bearerToken.length - 1];

  // checking if the session exist and is not expired
  const session = await sessionRepo.findOne({
    where: { id: token, expire: MoreThan(Date.now()) },
    relations: ['user'],
  });
  if (!session) {
    throw Communication.err(
      Status.ERROR_INVALID_SESSION,
      'Invalid or expired session.',
    );
  }

  // incorporates corresponding user in the request body
  req.body.user = session.user;

  // continues to the route if everything is alright
  next();
}
