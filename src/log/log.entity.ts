import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Session, User } from '../user/user.entity';
import { Node } from '../filesystem/filesystem.entity';
import { Link } from '../link/link.entity';

export enum LogType {
  USER = 'USER',
  NODE = 'NODE',
}

export enum ActivityType {
  USER_CREATION = 'USER_CREATION',
  USER_REGISTRATION = 'USER_REGISTRATION',
  USER_LOGIN = 'USER_LOGIN',
  USER_UPDATE = 'USER_UPDATE',
  USER_SUSPENSION = 'USER_SUSPENSION',
  USER_DELETION = 'USER_DELETION',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  FILE_SHARING = 'FILE_SHARING',
  FILE_DELETION = 'FILE_DELETION',
  FILE_MOVING = 'FILE_MOVING',
}

export abstract class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  timestamp: number;

  @Column({ type: 'enum', enum: LogType })
  logType: LogType;

  @Column({ type: 'enum', enum: ActivityType })
  activityType: ActivityType;
}

@Entity()
export class UserLog extends Log {
  @ManyToOne(() => User, (user) => user.subjectLogs)
  subject: User; // The user who is the subject of an activity, e.g., the user who is created by admin.

  @ManyToOne(() => User, (user) => user.performerLogs)
  performer: User; // The user who performs the activity, e.g., the admin who creates the user.
  // Sometimes the performer and the subject are the same person, e.g., the user who logs in.

  @ManyToOne(() => Session, (session) => session.logs)
  session: Session;
}

@Entity()
export class NodeLog extends Log {
  @ManyToOne(() => Node, (node) => node.logs)
  node: Node;

  @ManyToOne(() => Node, (node) => node.oldParentLogs)
  oldParent: Node;

  @ManyToOne(() => Node, (node) => node.newParentLogs)
  newParent: Node;

  @ManyToOne(() => User, (user) => user.nodeOwnerLogs)
  owner: User;

  @ManyToOne(() => User, (user) => user.nodeSharedWithLogs)
  sharedWith: User;

  @ManyToOne(() => Link, (link) => link.logs)
  sharingLink: Link;
}
