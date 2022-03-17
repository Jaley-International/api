import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Node } from '../filesystem/filesystem.entity';

@Entity()
export class Share {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shareKey: string;

  @Column()
  shareSignature: string;

  @ManyToOne(() => User, (user) => user.senderShares, { onDelete: 'CASCADE' })
  sender: User;

  @ManyToOne(() => User, (user) => user.recipientShares, {
    onDelete: 'CASCADE',
  })
  recipient: User;

  @ManyToOne(() => Node, (node) => node.shares, { onDelete: 'CASCADE' })
  node: Node;
}
