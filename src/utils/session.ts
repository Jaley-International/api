import { Request } from 'express';
import { getConnection, MoreThan } from 'typeorm';
import { Session, User } from '../user/user.entity';
import { err, Status } from './communication';

/**
 * Gets the authorization header from the request.
 * Throws an error if it doesn't exist.
 * Returns the authorization header value.
 */
export async function getHeaderSessionId(req: Request): Promise<string> {
  // getting authorization header
  const authHeader = req.header('authorization');
  if (!authHeader) {
    throw err(
      Status.ERROR_NO_AUTH_TOKEN,
      'Header does not contain any authorization field.',
    );
  }
  // getting the session id from the string
  const bearerToken = authHeader.split(' ');
  return bearerToken[bearerToken.length - 1];
}

/**
 * Returns a session by id.
 * Throws an exception if the session is not found or expired.
 * Throws also an exception if the associated user does not exist.
 */
async function getValidSession(sessionId: string): Promise<Session> {
  const sessionRepo = getConnection().getRepository(Session);

  const session = await sessionRepo.findOne({
    where: { id: sessionId, expire: MoreThan(Date.now()) },
    relations: ['user'],
  });

  if (!session) {
    throw err(Status.ERROR_INVALID_SESSION, 'Not found or expired session.');
  }

  if (!session.user) {
    throw err(
      Status.ERROR_USER_NOT_FOUND,
      'No user corresponding to the current session has been found.',
    );
  }

  return session;
}

/**
 * Returns a session associated user.
 */
export async function getSessionUser(req: Request): Promise<User> {
  const sessionId = await getHeaderSessionId(req);
  const session = await getValidSession(sessionId);
  return session.user;
}
