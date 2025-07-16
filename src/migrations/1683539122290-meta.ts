import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class checkpoint1683539122290 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'meta',
        columns: [
          {
            name: 'key',
            type: 'nvarchar(64)',
            isPrimary: true,
            isUnique: true,
          },
          {
            name: 'value',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('meta')) await queryRunner.dropTable('meta');
  }
}
