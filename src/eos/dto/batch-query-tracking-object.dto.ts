import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsArray } from 'class-validator';
import { QueryDTO } from 'src/eos/dto/query-tracking-object.dto';

export class BatchQueryDTO {
  @ApiProperty({ required: true })
  @IsArray()
  data: [QueryDTO];
}
