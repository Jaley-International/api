import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';

export enum NodeType {
  FILE = 'file',
  FOLDER = 'folder',
}

@Entity()
@Tree('closure-table')
export class NodeEntity {
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

  @ManyToOne(() => UserEntity, (user) => user.workspaces)
  workspaceOwner: UserEntity;

  @TreeParent()
  parent: NodeEntity;

  @TreeChildren()
  children: NodeEntity[];
}
