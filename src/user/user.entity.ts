import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Node } from '../filesystem/filesystem.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ update: false })
  username: string;

  @Column()
  email: string;

  @BeforeInsert()
  emailToLowercase() {
    this.email = this.email.toLocaleLowerCase();
  }

  @Column()
  clientRandomValue: string;

  @Column()
  encryptedMasterKey: string;

  @Column()
  hashedAuthenticationKey: string;

  @Column({ length: 10000 })
  encryptedRsaPrivateSharingKey: string;

  @Column({ length: 1000 })
  rsaPublicSharingKey: string;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Node, (node) => node.treeOwner)
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

  @ManyToOne(() => User, (user) => user.sessions)
  user: User;
}
