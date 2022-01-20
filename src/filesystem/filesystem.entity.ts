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
  isFolder: boolean;

  @Column()
  encryptedKey: string;

  @Column({ nullable: true })
  encryptedParentKey: string;

  @Column()
  encryptedMetadata: string;

  @Column()
  realPath: string;

  @ManyToOne(() => UserEntity, (user) => user.workspaces)
  workspaceOwner: UserEntity;

  @TreeChildren()
  children: NodeEntity[];

  @TreeParent()
  parent: NodeEntity;
}
