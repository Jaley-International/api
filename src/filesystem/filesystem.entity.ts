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

@Entity()
@Tree('materialized-path')
export class NodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  encryptedKey: string;

  @Column()
  encryptedMetadata: string;

  @Column()
  isFolder: boolean;

  @Column({ nullable: true })
  realPath: string;

  @Column({ nullable: true })
  encryptedParentKey: string;

  @ManyToOne(() => UserEntity, (user) => user.workspaces)
  workspaceOwner: UserEntity;

  @TreeParent()
  parent: NodeEntity;

  @TreeChildren()
  children: NodeEntity[];
}
