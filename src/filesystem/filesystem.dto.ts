import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  encryptedFileName: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  encryptedMetadata: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedKey: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedParentKey: string;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  parentId: number;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  userId: number;
}

export class CreateFolderDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  encryptedMetadata: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedKey: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedParentKey: string;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  parentId: number;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  userId: number;
}

export class CreateRootDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  encryptedMetadata: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedKey: string;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  userId: number;
}

export class DownloadFileDto {
  @ApiProperty()
  @IsDefined()
  @IsNumber()
  NodeId: number;
}
