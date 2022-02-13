import { Request } from 'express';
import { getConnection, MoreThan } from 'typeorm';
import { Session, User } from '../user/user.entity';
import { err, Status } from './communication';

/**
 * Gets the authorization token from a request,
 * then checks if it corresponds to any current session.
 * Checks from this session if a corresponding user exists.
 * Throws an exception if any of these attempts fails.
 * Returns the found user.
 */
export async function getSessionUser(req: Request): Promise<User> {
  const sessionRepo = getConnection().getRepository(Session);
  const sessionId = await getSessionId(req);

  // getting current session
  const session = await sessionRepo.findOne({
    where: { id: sessionId, expire: MoreThan(Date.now()) },
    relations: ['user'],
  });
  // checking if the session exist and is not expired
  if (!session) {
    throw err(Status.ERROR_INVALID_SESSION, 'Invalid or expired session.');
  }
  // checking if the session corresponds to an existing user
  if (!session.user) {
    throw err(
      Status.ERROR_USER_NOT_FOUND,
      'No user corresponding to the current session has been found.',
    );
  }

  // returning the user
  return session.user;
}

/**
 * Gets the authorization header from the request.
 * Throws an error if it doesn't exist.
 * Returns the authorization header value.
 */
export async function getSessionId(req: Request): Promise<string> {
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
