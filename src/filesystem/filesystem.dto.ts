import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.entity';

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
  encryptedKey: string;

  @ApiProperty()
  @IsDefined()
  user: User;

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
  ref: string;
}

export class GetNodeDto {
  @ApiProperty()
  @IsDefined()
  @IsInt()
  nodeId: number;

  @ApiProperty()
  @IsDefined()
  user: User;
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
  newRef: string;
}
