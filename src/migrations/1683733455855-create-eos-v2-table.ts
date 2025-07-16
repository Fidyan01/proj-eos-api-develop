import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class createEosV2Table1683733455855 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'eos_v2',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'eos_id',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'event_sub_stage',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'timestamp',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'hash_id',
            type: 'varchar(128)',
            isNullable: false,
          },
          {
            name: 'field1',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'field2',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'field3',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'field4',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'field5',
            type: 'varchar(16)',
            isNullable: false,
          },
          {
            name: 'field6',
            type: 'varchar(16)',
            isNullable: false,
          },
          {
            name: 'field7',
            type: 'varchar(16)',
            isNullable: false,
          },
          {
            name: 'field8',
            type: 'varchar(16)',
            isNullable: false,
          },
          {
            name: 'field9',
            type: 'varchar(16)',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'INT',
            isNullable: false,
            default: 0,
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
    await queryRunner.createIndices('eos_v2', [
      new TableIndex({
        columnNames: ['hash_id'],
        isUnique: true,
        name: 'IDX-eos-v2-hash_id',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('eos')) await queryRunner.dropTable('eos_v2');
  }
}
