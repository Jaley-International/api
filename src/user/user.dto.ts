import {
  IsArray,
  IsDefined,
  IsEmail,
  IsString,
  Matches,
} from 'class-validator';

export class GetSaltDto {
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z-]{3,16}$/)
  username: string;
}

export class AuthenticationDto {
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z-]{3,16}$/)
  username: string;

  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]{64}$/)
  derivedAuthenticationKey: string;
}

export class CreateUserDto {
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z-]{3,16}$/)
  username: string;

  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]{32}$/)
  clientRandomValue: string;

  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]{128}$/)
  encryptedMasterKey: string;

  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]{128}$/)
  hashedAuthenticationKey: string;

  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]+$/)
  encryptedRsaPrivateSharingKey: string;

  @IsDefined()
  @IsString()
  rsaPublicSharingKey: string;

  @IsDefined()
  @IsEmail()
  email: string;

  @IsArray()
  sessionIdentifiers: string[];
}

export class UserSaltDto {
  @IsDefined()
  @IsString()
  salt: string;
}

export class LoginResponseDto {
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]{128}$/)
  encryptedMasterKey: string;

  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]+$/)
  encryptedRsaPrivateSharingKey: string;

  @IsDefined()
  @IsString()
  rsaPublicSharingKey: string;

  @IsDefined()
  @IsString()
  encryptedSessionIdentifier: string;
}
