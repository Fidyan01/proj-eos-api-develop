import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsIn,
  IsOptional,
  IsPositive,
  Max,
  IsString,
  IsNumber,
} from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'DESC or ASC',
    example: 'DESC',
  })
  @IsIn(['DESC', 'ASC'])
  @IsOptional()
  sortType: 'DESC' | 'ASC';

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsPositive()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Max(1000)
  @IsPositive()
  @IsOptional()
  size?: number = 20;

  @ApiPropertyOptional({ example: 9999999999 })
  @IsNumber()
  from?: number;

  @ApiPropertyOptional({ example: 9999999999999 })
  @IsNumber()
  to?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  deviceId?: number;
}
