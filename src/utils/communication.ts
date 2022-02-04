export enum Status {
  SUCCESS = 'SUCCESS',
  USER_NOT_FOUND = 'ERROR_USER_NOT_FOUND',
  NODE_NOT_FOUND = 'ERROR_NODE_NOT_FOUND',
  NO_FILE_SENT = 'ERROR_NO_FILE_SENT',
}

export class Communication {
  static res(status: Status, verbose: string, data: object): object {
    return { status: status, verbose: verbose, data: data };
  }
}
