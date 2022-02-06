import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Node } from '../filesystem/filesystem.entity';

@Entity()
export class Link {
  @PrimaryColumn()
  id: string;

  @Column()
  encryptedNodeKey: string;

  @Column()
  encryptedShareKey: string;

  @Column()
  iv: string;

  @ManyToOne(() => Node, (node) => node.links, { onDelete: 'CASCADE' })
  node: Node;
}
