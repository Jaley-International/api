import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  encryptedMetadata: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]+$/)
  iv: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[0-9a-f]*$/)
  tag: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedNodeKey: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]*$/)
  parentEncryptedKey: string;

  @ApiProperty()
  @IsDefined()
  @IsInt()
  parentId: number;
}

export class CreateFileDto extends CreateFolderDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  ref: string;
}

export class UpdateMetadataDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  newEncryptedMetadata: string;
}

export class UpdateParentDto {
  @ApiProperty()
  @IsDefined()
  @IsInt()
  newParentId: number;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]*$/)
  newParentEncryptedKey: string;
}

export class UpdateRefDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  newRef: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  newEncryptedMetadata: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[0-9a-f]*$/)
  newTag: string;
}
