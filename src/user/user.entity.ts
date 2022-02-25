import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Node } from '../filesystem/filesystem.entity';

export enum AccessLevel {
  ADMINISTRATOR = 'ADMINISTRATOR',
  USER = 'USER',
  GUEST = 'GUEST',
}

export enum UserStatus {
  OK = 'OK',
  PENDING_REGISTRATION = 'PENDING_REGISTRATION',
  SUSPENDED = 'SUSPENDED',
}

@Entity()
export class User {
  @PrimaryColumn()
  username: string;

  @Column()
  email: string;

  @BeforeInsert()
  emailToLowercase() {
    this.email = this.email.toLocaleLowerCase();
  }

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  group: string;

  @Column()
  job: string;

  @Column({ type: 'enum', enum: AccessLevel })
  accessLevel: AccessLevel;

  @Column({ type: 'enum', enum: UserStatus })
  userStatus: UserStatus;

  @Column()
  registerKey: string;

  @Column({ nullable: true })
  clientRandomValue: string;

  @Column({ nullable: true })
  encryptedMasterKey: string;

  @Column({ nullable: true })
  hashedAuthenticationKey: string;

  @Column({ nullable: true, length: 10000 })
  encryptedRsaPrivateSharingKey: string;

  @Column({ nullable: true, length: 1000 })
  rsaPublicSharingKey: string;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Node, (node) => node.owner)
  nodes: Node[];
}

@Entity()
export class Session {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'bigint' })
  expire: number;

  @Column({ type: 'bigint' })
  issuedAt: number;

  @Column()
  ip: string;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  user: User;
}
