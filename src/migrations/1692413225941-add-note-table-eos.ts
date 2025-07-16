import {MigrationInterface, QueryRunner} from "typeorm";

export class addNoteTableEos1692413225941 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          'ALTER TABLE `eos_v2` ADD `note` TEXT NULL',
        );
        await queryRunner.query(
          'ALTER TABLE `eos_headers` ADD `note` TEXT NULL',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
