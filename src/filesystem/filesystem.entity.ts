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
  encryptedKey: string;

  @Column()
  encryptedMetadata: string;

  @Column({ type: 'enum', enum: NodeType, update: false })
  type: NodeType;

  @Column()
  ref: string;

  @Column()
  encryptedParentKey: string;

  @ManyToOne(() => User, (user) => user.nodes)
  owner: User;

  @OneToMany(() => Link, (link) => link.node)
  links: Link[];

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Node;

  @TreeChildren()
  children: Node[];
}
