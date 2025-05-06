import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewColumnOnMedicalCheckTable1676533510064
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE medical_checks ADD COLUMN sample_collection TIMESTAMP NULL AFTER result_status"
    );
    await queryRunner.query(
      "ALTER TABLE medical_checks ADD COLUMN sample_received TIMESTAMP NULL AFTER sample_collection"
    );
    await queryRunner.query(
      "ALTER TABLE medical_checks ADD COLUMN doctor_name varchar(50) NULL AFTER sample_received"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("medical_checks", [
      "sample_collection",
      "sample_received",
      "doctor_name",
    ]);
  }
}
