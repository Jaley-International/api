import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Node } from '../filesystem/filesystem.entity';
import { ShareLog } from '../log/log.entity';

@Entity()
export class Share {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000 })
  shareKey: string;

  @Column({ length: 1000 })
  shareSignature: string;

  @ManyToOne(() => User, (user) => user.senderShares, { onDelete: 'CASCADE' })
  sender: User;

  @ManyToOne(() => User, (user) => user.recipientShares, {
    onDelete: 'CASCADE',
  })
  recipient: User;

  @ManyToOne(() => Node, (node) => node.shares, { onDelete: 'CASCADE' })
  node: Node;

  // logs

  @OneToMany(() => ShareLog, (shareLog) => shareLog.share)
  logs: ShareLog[];
}
