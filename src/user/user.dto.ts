import { IsDefined, IsEmail, IsEnum, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccessLevel } from './user.entity';

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

export class RegisterUserDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  registerKey: string;

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
  @IsString()
  encryptedInstancePublicKey: string;
}

export class PreRegisterUserDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z-]{3,16}$/)
  username: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z-]{1,32}$/)
  firstName: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z-]{1,32}$/)
  lastName: string;

  @ApiProperty()
  @IsDefined()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  group: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  job: string;

  @ApiProperty()
  @IsDefined()
  @IsEnum(AccessLevel)
  accessLevel: AccessLevel;
}

export class UpdateUserDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsDefined()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  group: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  job: string;

  @ApiProperty()
  @IsDefined()
  @IsEnum(AccessLevel)
  accessLevel: AccessLevel;
}
