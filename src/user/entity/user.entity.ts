import { BeforeInsert, Column, Entity, ObjectID, ObjectIdColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @ObjectIdColumn() 
  id: ObjectID; 

  @Column()
  name: string;

  @Column({unique:true})
  email: string;


  @Column({select:false})
  password: string;

  @BeforeInsert()
  emailtolowercase(){
    this.email = this.email.toLocaleLowerCase()
  }
}