import { Module } from '@nestjs/common';
import { StudentModule } from 'src/student/student.module';
import { TeacherModule } from 'src/teacher/teacher.module';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {User} from "../entity/user";




@Module({
  
  imports: [StudentModule,TeacherModule,UserModule,
  TypeOrmModule.forRoot({
    type: 'mongodb',
    url: 'mongodb+srv://agung:Tokowanda1@cluster0.cbpae.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    entities: [User],
    synchronize: true,
  })]
})
export class AppModule {}
