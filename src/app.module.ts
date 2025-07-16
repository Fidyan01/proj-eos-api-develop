import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsoleModule } from 'nestjs-console';
import { BullMQModule } from 'src/bullmq/bullmq.module';
import { SystemConfigModule } from 'src/config/system-config.module';
import { RedisModule } from 'src/redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserRoleModule } from './user-role/user-role.module';
import { UserModule } from './user/user.module';
import { EosModule } from 'src/eos/eos.module';
import { QueueModule } from 'src/queue/queue.module';
import { QueueConsumer } from 'src/queue/queue.consumer';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { getDBPassword } from 'src/shares/helpers/encryption';
// import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,

    ConsoleModule,
    // TypeOrmModule.forRoot(MYSQL_CONFIG),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT) || 3306,
      username: process.env.MYSQL_USER || 'eos',
      password: getDBPassword() || 'admin123',
      database: process.env.MYSQL_DATABASE || 'eos',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrationsTableName: 'migrations',
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      cli: {
        migrationsDir: 'src/migrations',
      },
      synchronize: false,
      // migrationsRun: true,
      logging: true,
    }),
    // AuthModule,
    // UserModule,
    // UserRoleModule,
    HttpModule,
    SystemConfigModule,
    BullMQModule,
    EosModule,
    QueueModule,
    CrawlerModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
