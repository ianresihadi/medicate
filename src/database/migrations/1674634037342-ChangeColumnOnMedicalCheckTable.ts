import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnOnMedicalCheckTable1674634037342
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_checks", "result");
    await queryRunner.query(
      "ALTER TABLE `medical_checks` ADD `selfie` varchar(255) NULL AFTER additional_document"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_checks", "selfie");
    await queryRunner.query(
      "ALTER TABLE `medical_checks` ADD `result` varchar(255) NULL AFTER additional_document"
    );
  }
}
