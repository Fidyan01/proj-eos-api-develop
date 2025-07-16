import { Command, Console } from 'nestjs-console';
import { CrawlerService } from 'src/crawler/crawler.service';

@Console()
export class CrawlerConsole {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Command({
    command: 'crawler',
    description: 'run crawler',
  })
  runCrawler() {
    console.log('Start to run crawler');
    return this.crawlerService.syncEvents();
  }
}
