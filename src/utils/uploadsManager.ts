import { existsSync, mkdirSync, rename, unlinkSync } from 'fs';
import findRemoveSync from 'find-remove';
import { Communication, Status } from './communication';
import { NodeType, Node } from '../filesystem/filesystem.entity';

export class UploadsManager {
  static readonly tmpFolder = './tmp/';
  static readonly uploadFolder = './uploads/';

  /**
   * Moves a file stored in temporary folder to permanent folder.
   * Throws an exception if no file is found in the temporary folder.
   */
  static moveFileFromTmpToPermanent(filename: string) {
    const currentFilePath = UploadsManager.tmpFolder + filename;
    const newFilePath = UploadsManager.uploadFolder + filename;

    // checking if desired file exist in tmp folder
    if (!existsSync(currentFilePath)) {
      throw Communication.err(
        Status.ERROR_INVALID_FILE,
        'Expired or non existing file.',
      );
    }
    // checks if upload directory exist, creates it if not
    // prevents error during file renaming below
    if (!existsSync(UploadsManager.uploadFolder)) {
      mkdirSync(UploadsManager.uploadFolder);
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
    findRemoveSync(UploadsManager.tmpFolder, {
      files: '*.*',
    });
  }

  /**
   * Deletes files old enough inside the temporary folder after 30 seconds.
   */
  static deleteTmpFile(filename: string) {
    findRemoveSync(UploadsManager.tmpFolder, {
      files: filename,
    });
  }

  /**
   * Removes a node's corresponding file on disk
   * if the node represents a file.
   */
  static deletePermanentFile(node: Node) {
    if (node.type === NodeType.FILE) {
      const filePath = UploadsManager.uploadFolder + node.ref;
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }
  }
}
