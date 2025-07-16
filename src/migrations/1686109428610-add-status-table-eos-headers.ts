import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addStatusTableEosHeaders1686109428610
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'eos_headers',
      new TableColumn({
        name: 'tx_status',
        type: 'int',
        isNullable: true,
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
