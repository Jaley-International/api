import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Link } from '../link/link.entity';
import { NodeLog, NodeMovingLog } from '../log/log.entity';
import { Share } from '../share/share.entity';

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
  iv: string;

  @Column()
  tag: string;

  @Column()
  encryptedNodeKey: string;

  @Column()
  encryptedMetadata: string;

  @Column({ type: 'enum', enum: NodeType, update: false })
  type: NodeType;

  @Column()
  ref: string;

  @Column()
  parentEncryptedKey: string;

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => User, (user) => user.nodes)
  owner: User;

  @OneToMany(() => Link, (link) => link.node)
  links: Link[];

  // logs

  @OneToMany(() => NodeLog, (nodeLog) => nodeLog.node)
  logs: NodeLog[];

  @OneToMany(() => NodeLog, (nodeLog) => nodeLog.parent)
  parentLogs: NodeLog[];

  @OneToMany(() => NodeMovingLog, (nodeMovingLog) => nodeMovingLog.oldParent)
  oldParentLogs: NodeLog[];

  @OneToMany(() => NodeMovingLog, (nodeMovingLog) => nodeMovingLog.newParent)
  newParentLogs: NodeLog[];

  // shares

  @OneToMany(() => Share, (share) => share.node)
  shares: Share[];

  // tree relations

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Node;

  @TreeChildren()
  children: Node[];
}
