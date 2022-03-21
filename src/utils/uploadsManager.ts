import { existsSync, mkdirSync, rename, unlinkSync } from 'fs';
import findRemoveSync from 'find-remove';
import { err, Status } from './communication';
import { Node, NodeType } from '../filesystem/filesystem.entity';
import { join } from 'path';

export enum DiskFolders {
  TMP = './tmp/',
  PERM = './uploads/',
}

/**
 * Moves a file stored in temporary folder to permanent folder.
 * Throws an exception if no file is found in the temporary folder.
 */
export function moveFileFromTmpToPermanent(filename: string) {
  const currentFilePath = join(DiskFolders.TMP, filename);
  const newFilePath = join(DiskFolders.PERM, filename);

  // checking if desired file exist in tmp folder
  if (!existsSync(currentFilePath)) {
    throw err(Status.ERROR_INVALID_FILE, 'Expired or non existing file.');
  }
  // checks if upload directory exist, creates it if not
  // prevents error during file renaming below
  if (!existsSync(DiskFolders.PERM)) {
    mkdirSync(DiskFolders.PERM);
  }
  // moving file from temporary disk folder to permanent folder
  rename(currentFilePath, newFilePath, (err) => {
    if (err) throw err;
  });
}

/**
 * Deletes files old enough inside the temporary folder.
 */
export function purgeTmpFolder() {
  findRemoveSync(DiskFolders.TMP, {
    files: '*.*',
  });
}

/**
 * Deletes files old enough inside the temporary folder after some time.
 */
export function deleteTmpFile(filename: string) {
  findRemoveSync(DiskFolders.TMP, {
    files: filename,
  });
}

/**
 * Removes a node's corresponding file on disk
 * if the node represents a file.
 */
export function deletePermanentFile(node: Node) {
  if (node.type === NodeType.FILE) {
    const filePath = join(DiskFolders.PERM, node.ref);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}
