import { existsSync, mkdirSync, rename } from 'fs';
import { HttpException, HttpStatus } from '@nestjs/common';

export class Utils {
  static readonly tmpFolder = './tmpUploads/';
  static readonly uploadFolder = './uploads/';

  /**
   * Moves a file stored in temporary folder to permanent folder.
   * Throws an exception if no file is found in the temporary folder.
   */
  static moveFileFromTmpToPermanent(filename: string) {
    const currentFilePath = Utils.tmpFolder + filename;
    const newFilePath = Utils.uploadFolder + filename;

    // checking if desired file exist in tmp folder
    if (!existsSync(currentFilePath)) {
      throw new HttpException(
        'expired or non existing file',
        HttpStatus.NOT_FOUND,
      );
    }
    // checks if upload directory exist, creates it if not
    // prevents error during file renaming below
    if (!existsSync(Utils.uploadFolder)) {
      mkdirSync(Utils.uploadFolder);
    }
    // moving file from temporary disk folder to permanent folder
    rename(currentFilePath, newFilePath, (err) => {
      if (err) throw err;
    });
  }
}
