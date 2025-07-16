import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class createUsersTable1652824226376 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar(20)',
          },
          {
            name: 'status',
            type: 'varchar(20)',
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
    await queryRunner.createIndices('users', [
      new TableIndex({
        columnNames: ['email'],
        isUnique: true,
        name: 'IDX-users-email',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('users'))
      await queryRunner.dropTable('users');
  }
}
