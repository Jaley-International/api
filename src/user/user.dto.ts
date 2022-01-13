import { IsEmail, IsString, Matches } from 'class-validator';

export class GetSaltDto {
  @Matches(/^[0-9a-zA-Z-]{3,16}$/)
  username: string;
}

export class AuthenticationDto extends GetSaltDto {
  @Matches(/^[0-9a-zA-Z-]{3,16}$/)
  username: string;

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

export class UserSaltDto {
  @IsString()
  salt: string;
}

export class LoginResponseDto {
  @Matches(/^[0-9a-f]{128}$/)
  encryptedMasterKey: string;

  @Matches(/^[0-9a-f]+$/)
  encryptedRsaPrivateSharingKey: string;

  @IsString()
  rsaPublicSharingKey: string;

  @IsString()
  encryptedSessionIdentifier: string;
}
