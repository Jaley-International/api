import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { User } from '../user/user.entity';
import { existsSync, unlinkSync } from 'fs';
import { UploadFoldersManager } from '../utils/uploadFoldersManager';

export enum NodeType {
  FILE = 'FILE',
  FOLDER = 'FOLDER',
}

@Entity()
@Tree('materialized-path')
export class Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  encryptedKey: string;

  @Column()
  encryptedMetadata: string;

  @Column({ type: 'enum', enum: NodeType, update: false })
  type: NodeType;

  @Column()
  ref: string;

  @Column()
  encryptedParentKey: string;

  @ManyToOne(() => User, (user) => user.nodes, { onDelete: 'CASCADE' })
  owner: User;

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Node;

  @TreeChildren()
  children: Node[];

  /**
   * Removes the node's corresponding file on disk
   * if the node represents a file.
   */
  deleteStoredFile() {
    if (this.type === NodeType.FILE) {
      const filePath = UploadFoldersManager.uploadFolder + this.ref;
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }
  }
}
