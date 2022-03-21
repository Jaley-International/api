import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsString, Matches } from 'class-validator';

export class ShareNodeDto {
  @ApiProperty()
  @IsDefined()
  @IsInt()
  nodeId: number;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @Matches(/^[0-9a-zA-Z-]{3,16}$/)
  recipientUsername: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  shareKey: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  shareSignature: string;
}
