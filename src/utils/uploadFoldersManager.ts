import { existsSync, mkdirSync, rename } from 'fs';
import findRemoveSync from 'find-remove';
import { Communication, Status } from './communication';

export class UploadFoldersManager {
  static readonly tmpFolder = './tmp/';
  static readonly uploadFolder = './uploads/';

  /**
   * Moves a file stored in temporary folder to permanent folder.
   * Throws an exception if no file is found in the temporary folder.
   */
  static moveFileFromTmpToPermanent(filename: string) {
    const currentFilePath = UploadFoldersManager.tmpFolder + filename;
    const newFilePath = UploadFoldersManager.uploadFolder + filename;

    // checking if desired file exist in tmp folder
    if (!existsSync(currentFilePath)) {
      throw Communication.err(
        Status.ERROR_INVALID_FILE,
        'Expired or non existing file.',
      );
    }
    // checks if upload directory exist, creates it if not
    // prevents error during file renaming below
    if (!existsSync(UploadFoldersManager.uploadFolder)) {
      mkdirSync(UploadFoldersManager.uploadFolder);
    }
    // moving file from temporary disk folder to permanent folder
    rename(currentFilePath, newFilePath, (err) => {
      if (err) throw err;
    });
  }

  /**
   * Deletes files old enough inside the temporary folder.
   */
  static purgeTmpFolder() {
    findRemoveSync(UploadFoldersManager.tmpFolder, {
      files: '*.*',
    });
  }

  /**
   * Deletes files old enough inside the temporary folder after 30 seconds.
   */
  static deleteTmpFile(filename: string) {
    findRemoveSync(UploadFoldersManager.tmpFolder, {
      files: filename,
    });
  }
}
