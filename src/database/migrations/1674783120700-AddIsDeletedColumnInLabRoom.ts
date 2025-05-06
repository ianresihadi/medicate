import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsDeletedColumnInLabRoom1674783120700
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `lab_rooms` ADD `is_deleted` tinyint(1) default 0 NOT NULL AFTER clinic_id"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("lab_rooms", "is_deleted");
  }
}
