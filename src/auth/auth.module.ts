import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: '1234',
      signOptions: { expiresIn: '600000000000000000s' },
    }),
  ],
})
export class AuthModule {}
