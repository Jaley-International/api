import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NodeEntity } from '../filesystem/filesystem.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ update: false })
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

  @Column()
  email: string;

  @Column('simple-array')
  sessionIdentifiers: string[];

  @BeforeInsert()
  emailToLowercase() {
    this.email = this.email.toLocaleLowerCase();
  }

  @OneToMany(() => NodeEntity, (workspace) => workspace.workspaceOwner)
  workspaces: NodeEntity[];
}
