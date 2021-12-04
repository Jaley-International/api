import { BeforeInsert, Column, Entity, ObjectID, ObjectIdColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @ObjectIdColumn() 
  id: ObjectID; 

  @Column({unique:true})
  username: string;

  @Column()
  clientRandomValue: string;

  @Column()
  encryptedMasterKey: string;

  @Column()
  hashedAuthenticationKey: string;

  @Column()
  encryptedRsaPrivateSharingKey: string;

  @Column()
  rsaPublicSharingKey: string;

  @Column({unique:true})
  email: string;


  @BeforeInsert()
  @Column("string", { array: true })
  sessionIdentifiers: string[];


  @BeforeInsert()
  emailtolowercase(){
    this.email = this.email.toLocaleLowerCase()
  }
}