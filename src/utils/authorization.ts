import { AccessLevel, User } from '../user/user.entity';
import { err, Status } from './communication';

/**
 * Checks if user access level is administrator.
 * Returns true if user is admin, and false otherwise.
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
