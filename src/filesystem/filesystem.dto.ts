import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsInt()
  userId: number;
}

export class CreateFolderDto extends CreateRootDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z]+$/)
  encryptedParentKey: string;

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
  encryptedFileName: string;
}

export class GetNodeDto {
  @ApiProperty()
  @IsDefined()
  @IsInt()
  nodeId: number;

  @ApiProperty()
  @IsDefined()
  @IsInt()
  treeOwnerId: number;
}

export class UpdateMetadataDto extends GetNodeDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  newEncryptedMetadata: string;
}

export class UpdateParentDto extends GetNodeDto {
  @ApiProperty()
  @IsDefined()
  @IsInt()
  newParentId: number;
}

export class UpdateRefDto extends GetNodeDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  newEncryptedFileName: string;
}
