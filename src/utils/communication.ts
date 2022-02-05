import { HttpException, HttpStatus } from '@nestjs/common';

export enum Status {
  SUCCESS = 'SUCCESS',
  ERROR_USER_NOT_FOUND = 'ERROR_USER_NOT_FOUND',
  ERROR_NODE_NOT_FOUND = 'ERROR_NODE_NOT_FOUND',
  ERROR_INVALID_FILE = 'ERROR_INVALID_FILE',
  ERROR_USERNAME_ALREADY_USED = 'ERROR_USERNAME_ALREADY_USED',
  ERROR_EMAIL_ALREADY_USED = 'ERROR_EMAIL_ALREADY_USED',
  ERROR_INVALID_CREDENTIALS = 'ERROR_INVALID_CREDENTIALS',
  ERROR_INVALID_SESSION = 'ERROR_INVALID_SESSION',
}

export class Communication {
  /**
   * Returns an object representing a response body.
   * This is meant to be returned in a controller as a response.
   */
  static res(status: Status, verbose: string, data: object): object {
    return { status: status, verbose: verbose, data: data };
  }

  /**
   * Returns a custom exception in case of error.
   * This is meant to be thrown as an error and will be automatically sent to client.
   */
  static err(status: Status, verbose: string): HttpException {
    return new HttpException(
      { status: status, verbose: verbose },
      HttpStatus.BAD_REQUEST,
    );
  }
}
