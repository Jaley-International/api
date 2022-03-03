import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Node } from '../filesystem/filesystem.entity';
import { NodeLog } from '../log/log.entity';

@Entity()
export class Link {
  @PrimaryColumn()
  shareId: string;

  @Column()
  encryptedNodeKey: string;

  @Column()
  encryptedShareKey: string;

  @Column()
  iv: string;

  @ManyToOne(() => Node, (node) => node.links, { onDelete: 'CASCADE' })
  node: Node;

  @OneToMany(() => NodeLog, (nodeLog) => nodeLog.sharingLink)
  logs: NodeLog[];
}
