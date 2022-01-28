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
import { unlinkSync } from 'fs';
import { Constants } from '../logic/constants';

export enum NodeType {
  FILE = 'file',
  FOLDER = 'folder',
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

  @Column({ nullable: true })
  ref: string;

  @Column({ nullable: true })
  encryptedParentKey: string;

  @ManyToOne(() => User, (user) => user.nodes, { onDelete: 'CASCADE' })
  workspaceOwner: User;

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
      unlinkSync(Constants.uploadFolder + this.ref);
    }
  }
}
