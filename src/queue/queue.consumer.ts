import {
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import EosService from 'src/eos/eos.service';

@Processor('transaction-event')
export class QueueConsumer {
  constructor(private readonly eosService: EosService) {}

  @Process('batch-transaction-job')
  async batchTransactionJobHandler(job: Job<unknown>) {
    await this.eosService.submitBatchHashOnchain(
      job.data['data']['ids'],
      job.data['data']['toChainData'],
    );
  }

  @Process('batch-header-job')
  async batchHeaderJobHandler(job: Job<unknown>) {
    try {
      await this.eosService.submitBatchHeaderOnchain(job.data['data'] as []);
    } catch (error) {
      console.log(error);
    }
  }

  @OnQueueCompleted()
  onComplete(job: any) {
    console.info(
      `Completed job ${job.id} of type ${job.name} with result ${JSON.stringify(
        job.returnvalue,
      )}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: any) {
    console.info(
      `Failed job ${job.id} of type ${job.name} with result ${JSON.stringify(
        job.returnvalue,
      )}`,
    );
  }

  @OnQueueError()
  onError(job: any) {
    console.info(
      `Error job ${job.id} of type ${job.name} with result ${JSON.stringify(
        job.returnvalue,
      )}`,
    );
  }
}
