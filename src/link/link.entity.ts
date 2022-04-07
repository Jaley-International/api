import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Node } from '../filesystem/filesystem.entity';
import { LinkLog } from '../log/log.entity';

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

  @ManyToOne(() => Node, (node) => node.links, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  node: Node;

  // logs

  @OneToMany(() => LinkLog, (linkLog) => linkLog.link)
  logs: LinkLog[];
}
