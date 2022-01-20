import {
  Column,
  Entity,
  ManyToOne,
  ObjectID,
  ObjectIdColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity()
@Tree('materialized-path')
export class NodeEntity {
  @ObjectIdColumn()
  id: ObjectID;

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
