import { existsSync, unlinkSync } from 'fs';
import { Node, NodeType } from '../filesystem/filesystem.entity';
import { join } from 'path';

export enum DiskFolders {
  PERM = './uploads/',
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
