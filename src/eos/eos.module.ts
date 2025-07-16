import { forwardRef, Global, Module } from '@nestjs/common';
import { EosController } from './eos.controller';
import EosService from './eos.service';
import { Eos } from './entities/eos.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoleModule } from 'src/user-role/user-role.module';
import { BullModule } from '@nestjs/bull';
import { QueueService } from 'src/queue/queue.service';
import { QueueModule } from 'src/queue/queue.module';
import { ConfigService } from '@nestjs/config';
import { EosV2 } from 'src/eos/entities/eos-v2.entity';
import { EosHeader } from 'src/eos/entities/eos-header.entity';
import { EOSConsole } from 'src/eos/eos.console';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Eos, EosV2, EosHeader]),
    QueueModule,
    ConfigService,
  ],
  controllers: [EosController],
  exports: [EosService, TypeOrmModule],
  providers: [EosService, EOSConsole],
})
export class EosModule {}
