import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, Transaction, TransactionRepository } from 'typeorm';
import { QueueService } from 'src/queue/queue.service';
import { SystemConfigService } from 'src/config/system-config.service';
import { Eos } from 'src/eos/entities/eos.entity';
import { Meta } from 'src/crawler/entities/meta.entity';
import Web3 from 'web3';
import EosService from 'src/eos/eos.service';

@Injectable()
export class CrawlerService {
  private web3: Web3;
  private confirmation = 10;
  private maxBlockToCrawl = 1000;
  private maxRetry = 4;
  private delayInterval = 5;
  constructor(
    @InjectRepository(Meta)
    private metaRepository: Repository<Meta>,
    private configService: SystemConfigService,
    private eosService: EosService,
  ) {
    this.web3 = new Web3(this.configService.provider);
    this.confirmation = this.configService.confirmation;
  }

  async delay(secs) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(2);
      }, secs * 1000);
    });
  }

  async saveCheckPoint(blockNumber) {
    const data = {
      currentBlock: blockNumber + 1,
      updatedDate: Date.now(),
    };

    const checkpoint = await this.metaRepository.findOne({ key: 'checkpoint' });

    if (data.currentBlock > checkpoint.value['currentBlock']) {
      checkpoint.value = data;
    }

    await this.metaRepository.save(checkpoint);
  }

  async loadCheckPoint() {
    const data = await this.metaRepository.findOne({ key: 'checkpoint' });

    let latest = 100000;

    let countGetLatest = this.maxRetry;
    while (countGetLatest > 0) {
      try {
        latest = await this.web3.eth.getBlockNumber();
        if (latest < 100000) {
          continue;
        } else {
          break;
        }
      } catch (e) {
        // Fail to get latest blocknumber;
        await this.delay(this.delayInterval);
        console.log(e);
      }

      countGetLatest--;
    }
    const begin = data.value.currentBlock;

    if (countGetLatest <= 0) {
      throw 'COULD NOT GET LATEST BLOCK FROM PROVIDER';
    }

    return {
      begin,
      latest,
      confirmation: this.confirmation,
    };
  }

  async syncEvents() {
    // Initialize if checkpoint is not created

    while (true) {
      const checkPoint = await this.loadCheckPoint();
      const from = checkPoint.begin;
      let to = checkPoint.latest - checkPoint.confirmation;

      if (to < from + checkPoint.confirmation) {
        await this.delay(this.delayInterval);
        continue;
      }

      if (to >= from + this.maxBlockToCrawl) {
        to = from + this.maxBlockToCrawl;
      }

      let countCrawl = this.maxRetry;

      while (countCrawl > 0) {
        try {
          await this.eosService.eosEventHandler(from, to);

          await this.saveCheckPoint(to);

          break;
        } catch (e) {
          console.log(e);
          await this.delay(this.delayInterval);
          countCrawl--;
        }
      }

      if (countCrawl <= 0) {
        throw 'COULD NOT GET LATEST BLOCK FROM PROVIDER';
      }
      await this.delay(this.delayInterval);
    }
  }
}
