import { Controller, Get, Post, Query } from '@nestjs/common';
import { QueueService } from 'src/queue/queue.service';

@Controller('test-queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('send-test')
  async portSendTest(@Query('msg') msg: string) {
    return await this.queueService.transactionPushToQueue(msg);
  }

  // @Post('send-smtp')
  // async portSendSmtp(@Query('msg') msg: string) {
  //   return await this.queueService.smtpPushToQueue(msg);
  // }
}
