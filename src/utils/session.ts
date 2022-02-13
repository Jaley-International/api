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
export async function sessionUser(req: Request): Promise<User> {
  const sessionRepo = getConnection().getRepository(Session);
  const authHeader = req.header('authorization');

  if (!authHeader) {
    throw err(
      Status.ERROR_NO_AUTH_TOKEN,
      'Header does not contain any authorization field.',
    );
  }

  // getting the token from the string
  const bearerToken = authHeader.split(' ');
  const token = bearerToken[bearerToken.length - 1];

  // getting current session
  const session = await sessionRepo.findOne({
    where: { id: token, expire: MoreThan(Date.now()) },
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
 * Returns the authorization header value.
 */
export async function getAuthHeader(req: Request): Promise<string> {
  const sessionId = req.header('authorization');
  if (!sessionId) {
    throw err(
      Status.ERROR_NO_AUTH_TOKEN,
      'Header does not contain any authorization field.',
    );
  }
  return sessionId;
}
