import { ConnectionOptions } from 'typeorm';

export const MYSQL_CONFIG: ConnectionOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3323,
  username: process.env.MYSQL_USER || 'eos',
  password: process.env.MYSQL_PASSWORD || 'secret123',
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
};
// uncomment below line to run migrate
module.exports = MYSQL_CONFIG;
