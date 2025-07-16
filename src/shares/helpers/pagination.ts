import { PageMetaDto } from 'src/shares/dtos/page-meta.dto';
import { PageOptionsDto } from 'src/shares/dtos/page-options.dto';
import { PageDto } from 'src/shares/dtos/page.dto';

export function pagination(pageNumber: number, size: number) {
  const page = pageNumber ? pageNumber : 1;
  const limit = size ? size : 10;
  return [page, limit];
}

export function toPageDto<K>(
  data: K[],
  pageOpt: PageOptionsDto,
  count: number,
): PageDto<K> {
  const pageMeta = new PageMetaDto(pageOpt, count);
  return new PageDto(data, pageMeta);
}
