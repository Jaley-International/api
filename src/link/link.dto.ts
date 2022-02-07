import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsString, Matches } from 'class-validator';

export class CreateLinkDto {
  @ApiProperty()
  @IsDefined()
  @IsInt()
  nodeId: number;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]+$/)
  encryptedNodeKey: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]+$/)
  encryptedShareKey: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-f]+$/)
  iv: string;
}
