import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('transaction-event') private queue: Queue) {}

  async transactionPushToQueue(data: any) {
    await this.queue.add('transaction-job', {
      data: data,
    });
  }

  async addWriteHeaderToQueue(data: any) {
    await this.queue.add('batch-header-job', {
      data: data,
    });
  }

  async batchTransactionPushToQueue(data: any) {
    await this.queue.add('batch-transaction-job', {
      data: data,
    });
  }

  async eventPushToQueue(data: any) {
    await this.queue.add('event-job', {
      data: data,
    });
  }

  async getDetail() {}
}
