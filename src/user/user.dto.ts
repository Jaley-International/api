import { IsDefined, IsEmail, IsInt, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export class AuthenticationDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z-]{3,16}$/)
  username: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]{64}$/)
  derivedAuthenticationKey: string;
}

export class CreateUserDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z-]{3,16}$/)
  username: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]{32}$/)
  clientRandomValue: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]{128}$/)
  encryptedMasterKey: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]{128}$/)
  hashedAuthenticationKey: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]+$/)
  encryptedRsaPrivateSharingKey: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  rsaPublicSharingKey: string;

  @ApiProperty()
  @IsDefined()
  @IsEmail()
  email: string;
}

export class UpdateUserDto {
  @ApiProperty()
  @IsDefined()
  @IsInt()
  userId: number;

  @ApiProperty()
  @IsDefined()
  @IsEmail()
  email: string;
}

export class DeleteUserDto {
  @ApiProperty()
  @IsDefined()
  user: User;
}
