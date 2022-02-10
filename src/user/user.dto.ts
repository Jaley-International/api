import { IsDefined, IsEmail, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsEmail()
  email: string;
}

export interface LoginDetails {
  encryptedMasterKey: string;
  encryptedRsaPrivateSharingKey: string;
  rsaPublicSharingKey: string;
  encryptedSessionIdentifier: string;
  sessionExpire: number;
}
