import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';

export class UploadFileDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  encryptedFileName: string;

  @IsDefined()
  @IsString()
  encryptedMetadata: string;

  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedKey: string;

  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedParentKey: string;

  @IsDefined()
  @IsNumber()
  parentId: number;

  @IsDefined()
  @IsNumber()
  userId: number;
}

export class UploadFolderDto {
  @IsDefined()
  @IsString()
  encryptedMetadata: string;

  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedKey: string;

  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedParentKey: string;

  @IsDefined()
  @IsNumber()
  parentId: number;

  @IsDefined()
  @IsNumber()
  userId: number;
}

export class UploadRootDto {
  @IsDefined()
  @IsString()
  encryptedMetadata: string;

  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedKey: string;

  @IsDefined()
  @IsNumber()
  userId: number;
}

export class UserFileSystemDto {
  @IsDefined()
  @IsInt()
  userId: string;
}
