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
import { NodeLog } from '../log/log.entity';

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

  @ManyToOne(() => User, (user) => user.nodes)
  owner: User;

  @OneToMany(() => Link, (link) => link.node)
  links: Link[];

  // logs

  @OneToMany(() => NodeLog, (nodeLog) => nodeLog.node)
  logs: NodeLog[];

  @OneToMany(() => NodeLog, (nodeLog) => nodeLog.oldParent)
  oldParentLogs: NodeLog[];

  @OneToMany(() => NodeLog, (nodeLog) => nodeLog.newParent)
  newParentLogs: NodeLog[];

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Node;

  @TreeChildren()
  children: Node[];
}
