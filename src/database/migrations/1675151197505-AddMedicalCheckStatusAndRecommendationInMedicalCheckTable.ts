import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMedicalCheckStatusAndRecommendationInMedicalCheckTable1675151197505
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE medical_checks ADD COLUMN recommendation TEXT NULL AFTER selfie"
    );
    await queryRunner.query(
      "ALTER TABLE medical_checks ADD COLUMN result_status varchar(20) NULL AFTER recommendation"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("medical_checks", [
      "recommendation",
      "result_status",
    ]);
  }
}
