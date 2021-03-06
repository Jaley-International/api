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
  USER_VALIDATION = 'USER_VALIDATION',
  USER_LOGIN = 'USER_LOGIN',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETION = 'USER_DELETION',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  FILE_SHARING = 'FILE_SHARING',
  FILE_DELETION = 'FILE_DELETION',
  FILE_MOVING = 'FILE_MOVING',
  FILE_OVERWRITE = 'FILE_OVERWRITE',
  FOLDER_CREATION = 'FOLDER_CREATION',
  FOLDER_SHARING = 'FOLDER_SHARING',
  FOLDER_DELETION = 'FOLDER_DELETION',
  FOLDER_MOVING = 'FOLDER_MOVING',
}

export abstract class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', update: false })
  timestamp: number;

  @Column({ type: 'enum', enum: LogType, update: false })
  logType: LogType;

  @Column({ type: 'enum', enum: ActivityType, update: false })
  activityType: ActivityType;
}

@Entity()
export class UserLog extends Log {
  @ManyToOne(() => User, (user) => user.subjectLogs, { onDelete: 'CASCADE' })
  subject: User; // The user who is the subject of an activity, e.g., the user who is created by admin.

  @ManyToOne(() => User, (user) => user.performerLogs, { onDelete: 'CASCADE' })
  performer: User; // The user who performs the activity, e.g., the admin who creates the user.
  // Sometimes the performer and the subject are the same person, e.g., the user who logs in.

  @ManyToOne(() => Session, (session) => session.userLogs, {
    onDelete: 'CASCADE',
  })
  session: Session; // The session of the activity performer.
}

@Entity()
export class NodeLog extends Log {
  @ManyToOne(() => Node, (node) => node.logs, { onDelete: 'CASCADE' })
  node: Node;

  @ManyToOne(() => Node, (node) => node.oldParentLogs, { onDelete: 'CASCADE' })
  oldParent: Node;

  @ManyToOne(() => Node, (node) => node.newParentLogs, { onDelete: 'CASCADE' })
  newParent: Node;

  @ManyToOne(() => User, (user) => user.nodeCurUserLogs, {
    onDelete: 'CASCADE',
  })
  curUser: User;

  @ManyToOne(() => Session, (session) => session.nodeLogs, {
    onDelete: 'CASCADE',
  })
  session: Session; // The session of the current user.

  @ManyToOne(() => User, (user) => user.nodeOwnerLogs, { onDelete: 'CASCADE' })
  owner: User;

  @ManyToOne(() => User, (user) => user.nodeSharedWithLogs, {
    onDelete: 'CASCADE',
  })
  sharedWith: User;

  @ManyToOne(() => Link, (link) => link.logs, { onDelete: 'CASCADE' })
  link: Link;
}
