import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class createEosHeaderTable1683733455855 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'eos_headers',
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
            name: 'hash_id',
            type: 'varchar(255)',
            isNullable: false,
          },
          {
            name: 'start_transaction',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'end_transaction',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'imo_number',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'arrival_id',
            type: 'varchar(64)',
            isNullable: false,
          },
          // {
          //   name: 'total_throughput', // remove it, 2023-07-10
          //   type: 'varchar(64)',
          //   isNullable: false,
          // },
          {
            name: 'vessel_name', // change to vessel_name, 2023-07-10
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'jetty',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'terminal_name',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'trader_name',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'agent',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'record_status',
            type: 'varchar(64)',
            isNullable: true,
          },
          {
            name: 'berthing_pilotage_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'vessel_size',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'pilotage_location_from_1',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'pilotage_location_to_1',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'arrival_status',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'unberthing_pilotage_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'pilotage_location_from_2',
            type: 'varchar(64)',
            isNullable: false,
          },
          {
            name: 'pilotage_location_to_2',
            type: 'varchar(64)',
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
    await queryRunner.createIndices('eos_headers', [
      new TableIndex({
        columnNames: ['hash_id'],
        isUnique: true,
        name: 'IDX-eos-header-hash_id',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('eos_headers');
  }
}
