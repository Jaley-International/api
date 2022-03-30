import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Node } from '../filesystem/filesystem.entity';
import {
  LinkLog,
  NodeLog,
  NodeMovingLog,
  ShareLog,
  UserLog,
} from '../log/log.entity';
import { Share } from '../share/share.entity';

export enum AccessLevel {
  ADMINISTRATOR = 'ADMINISTRATOR',
  USER = 'USER',
  GUEST = 'GUEST',
}

export enum UserStatus {
  OK = 'OK',
  PENDING_REGISTRATION = 'PENDING_REGISTRATION',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
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

  @Column({ unique: true })
  registerKey: string;

  @Column({ nullable: true, type: 'bigint' })
  createdAt: number;

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

  @Column({ nullable: true })
  encryptedInstancePublicKey: string;

  @Column({ nullable: true })
  encryptedInstancePrivateKey: string;

  @Column({ nullable: true })
  publicSharingKeySignature: string;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Node, (node) => node.owner)
  nodes: Node[];

  // logs

  @OneToMany(() => UserLog, (userLog) => userLog.subject)
  logs: UserLog[];

  // shares

  @OneToMany(() => Share, (share) => share.sender)
  senderShares: Share[];

  @OneToMany(() => Share, (share) => share.recipient)
  recipientShares: Share[];
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

  // logs

  @OneToMany(() => UserLog, (userLog) => userLog.session)
  userLogs: UserLog[];

  @OneToMany(() => NodeLog, (nodeLog) => nodeLog.session)
  nodeLogs: NodeLog[];

  @OneToMany(() => NodeMovingLog, (nodeMovingLog) => nodeMovingLog.session)
  nodeMovingLogs: NodeMovingLog[];

  @OneToMany(() => LinkLog, (linkLog) => linkLog.session)
  linkLogs: LinkLog[];

  @OneToMany(() => ShareLog, (shareLog) => shareLog.session)
  shareLogs: ShareLog[];
}
