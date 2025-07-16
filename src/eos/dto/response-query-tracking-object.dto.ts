import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ResponseQueryDTO {
  @ApiProperty()
  @IsString()
  data: string;
}

export class ResponseBatchQueryDTO {
  @ApiProperty()
  @IsArray()
  data: [string];
}
