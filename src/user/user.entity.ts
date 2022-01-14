import {
  BeforeInsert,
  Column,
  Entity,
  ObjectID,
  ObjectIdColumn,
  OneToMany,
} from 'typeorm';
import { NodeEntity } from '../filesystem/filesystem.entity';

@Entity()
export class UserEntity {
  @ObjectIdColumn()
  id: ObjectID;

  @Column({ unique: true })
  username: string;

  @Column()
  clientRandomValue: string;

  @Column()
  encryptedMasterKey: string;

  @Column()
  hashedAuthenticationKey: string;

  @Column()
  encryptedRsaPrivateSharingKey: string;

  @Column()
  rsaPublicSharingKey: string;

  @Column({ unique: true })
  email: string;

  @BeforeInsert()
  @Column({ array: true, default: [] })
  sessionIdentifiers: string[] = [];

  @BeforeInsert()
  emailToLowercase() {
    this.email = this.email.toLocaleLowerCase();
  }

  @OneToMany(() => NodeEntity, (workspace) => workspace.workspaceOwner)
  workspaces: NodeEntity[];
}
