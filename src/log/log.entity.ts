import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Session, User } from '../user/user.entity';
import { Node } from '../filesystem/filesystem.entity';
import { Link } from '../link/link.entity';
import { Share } from '../share/share.entity';

export enum UserActivityType {
  USER_CREATION = 'USER_CREATION',
  USER_REGISTRATION = 'USER_REGISTRATION',
  USER_VALIDATION = 'USER_VALIDATION',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETION = 'USER_DELETION',
}

export enum NodeActivityType {
  NODE_CREATION = 'NODE_CREATION',
  NODE_DELETION = 'NODE_DELETION',
  NODE_DOWNLOAD = 'NODE_DOWNLOAD',
  NODE_OVERWRITE = 'NODE_OVERWRITE',
}

export abstract class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', update: false })
  timestamp: number;

  @ManyToOne(() => Session, (session) => session.logs, {
    onDelete: 'CASCADE',
  })
  session: Session; // The session of the activity performer.
}

@Entity()
export class UserLog extends Log {
  @ManyToOne(() => User, (user) => user.logs, { onDelete: 'CASCADE' })
  subject: User; // The user who is the subject of an activity, e.g., the user who is created by admin.
  // Sometimes the performer and the subject are the same person, e.g., the user who logs in.

  @Column({ type: 'enum', enum: UserActivityType, update: false })
  type: UserActivityType;
}

@Entity()
export class NodeLog extends Log {
  @ManyToOne(() => Node, (node) => node.logs, { onDelete: 'CASCADE' })
  node: Node;

  @ManyToOne(() => Node, (node) => node.parentLogs, { onDelete: 'CASCADE' })
  parent: Node;

  @Column({ type: 'enum', enum: NodeActivityType, update: false })
  type: NodeActivityType;
}

@Entity()
export class NodeMovingLog extends Log {
  @ManyToOne(() => Node, (node) => node.logs, { onDelete: 'CASCADE' })
  node: Node;

  @ManyToOne(() => Node, (node) => node.oldParentLogs, { onDelete: 'CASCADE' })
  oldParent: Node;

  @ManyToOne(() => Node, (node) => node.newParentLogs, { onDelete: 'CASCADE' })
  newParent: Node;
}

@Entity()
export class LinkLog extends Log {
  @ManyToOne(() => Link, (link) => link.logs, { onDelete: 'CASCADE' })
  link: Link;
}

@Entity()
export class ShareLog extends Log {
  @ManyToOne(() => Share, (share) => share.logs, { onDelete: 'CASCADE' })
  share: Share;
}
