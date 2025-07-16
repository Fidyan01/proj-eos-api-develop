// BullModule.forRoot({
//     redis: {
//       host: process.env.REDIS_HOST,
//       port: Number(process.env.REDIS_PORT),
//     },
//   }),

import { Global, Module } from '@nestjs/common';
import { BullModule, BullQueueEvents } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QueueService } from 'src/queue/queue.service';
import { QueueController } from 'src/queue/queue.controller';
import { QueueConsumer } from 'src/queue/queue.consumer';
import { BullMQModule } from 'src/bullmq/bullmq.module';

// host: this.appConfig.get('REDIS_HOST'),
//       port: this.appConfig.get('REDIS_PORT'),

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),

    BullModule.registerQueue({
      name: 'transaction-event',
    }),
  ],
  controllers: [QueueController],
  providers: [QueueService, QueueConsumer],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
