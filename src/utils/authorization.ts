import { AccessLevel, User } from '../user/user.entity';
import { err, Status } from './communication';

/**
 * Returns a session associated user.
 */
export async function checkUserPrivileges(user: User): Promise<boolean> {
  if (user.accessLevel === AccessLevel.ADMINISTRATOR) {
    return true;
  } else {
    throw err(
      Status.ERROR_INVALID_ACCESS_LEVEL,
      'User Access Level is not Administrator.',
    );
  }
}
