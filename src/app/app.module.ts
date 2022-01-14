import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb+srv://agung:Tokowanda1@cluster0.cbpae.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
      database: 'test',
      entities: ['dist/src/**/*.entity.js'],
      autoLoadEntities: true,
      synchronize: true,
      useUnifiedTopology: true,
    }),
  ],
})
export class AppModule {}
