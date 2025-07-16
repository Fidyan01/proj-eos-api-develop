import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlerConsole } from 'src/crawler/crawler.console';
import { CrawlerService } from 'src/crawler/crawler.service';
import { Meta } from 'src/crawler/entities/meta.entity';
import { Eos } from 'src/eos/entities/eos.entity';
import { EosModule } from 'src/eos/eos.module';

@Module({
  imports: [forwardRef(() => EosModule), TypeOrmModule.forFeature([Meta, Eos])],
  providers: [CrawlerService, CrawlerConsole],
  controllers: [],
  exports: [CrawlerService],
})
export class CrawlerModule {}
