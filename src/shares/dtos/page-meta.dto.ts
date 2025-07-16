import { ApiProperty } from '@nestjs/swagger';

import type { PageOptionsDto } from './page-options.dto';

export class PageMetaDto {
  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly totalPage: number;

  @ApiProperty()
  readonly currentPage: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor(pageOptionsDto: PageOptionsDto, itemCount: number) {
    this.total = itemCount;
    this.totalPage = Math.ceil(this.total / pageOptionsDto.limit);
    this.currentPage = pageOptionsDto.page;
    this.hasPreviousPage = pageOptionsDto.page > 1;
    this.hasNextPage = pageOptionsDto.page < this.totalPage;
  }
}
