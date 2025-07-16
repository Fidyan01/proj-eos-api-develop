import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTxHashTableHeaderEos1690386718836
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `eos_v2` ADD `tx_hash` varchar(100) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `eos_headers` ADD `tx_hash` varchar(100) NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
