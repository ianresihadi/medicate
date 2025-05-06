import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnStatusOnMedicalCheckTable1674629506403
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_checks", "status");
    await queryRunner.query(
      "ALTER TABLE `medical_checks` ADD COLUMN `status` ENUM('on progress','process', 'waiting approve', 'approved', 'declined') NOT NULL DEFAULT 'on progress' AFTER `travel_detination`"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_checks", "status");
    await queryRunner.query(
      "ALTER TABLE `medical_checks` ADD COLUMN `status` ENUM('on progress', 'process', 'complete', 'declined') NOT NULL AFTER `travel_detination`"
    );
  }
}
