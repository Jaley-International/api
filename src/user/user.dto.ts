import { IsEmail, IsString, Matches } from 'class-validator';

export class LoginUserDto {
  @Matches(/^[0-9a-zA-Z-]{3,16}$/)
  username: string;
}

export class LoginUserDto2 extends LoginUserDto {
  @Matches(/^[0-9a-f]{64}$/)
  derivedAuthenticationKey: string;
}

export class CreateUserDto {
  @Matches(/^[0-9a-zA-Z-]{3,16}$/)
  username: string;

  @Matches(/^[0-9a-f]{32}$/)
  clientRandomValue: string;

  @Matches(/^[0-9a-f]{128}$/)
  encryptedMasterKey: string;

  @Matches(/^[0-9a-f]{128}$/)
  hashedAuthenticationKey: string;

  @Matches(/^[0-9a-f]+$/)
  encryptedRsaPrivateSharingKey: string;

  @IsString()
  rsaPublicSharingKey: string;

  @IsEmail()
  email: string;

  sessionIdentifiers: string[];
}

export class userSaltDto {
  @IsString()
  salt: string;
}

export class loginResponseDto {
  @Matches(/^[0-9a-f]{128}$/)
  encryptedMasterKey: string;

  @Matches(/^[0-9a-f]+$/)
  encryptedRsaPrivateSharingKey: string;

  @IsString()
  rsaPublicSharingKey: string;

  @IsString()
  encryptedSessionIdentifier: string;
}
