import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableMedicalCheckAddPhotoApplicant1736704646394
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "attachment_photo_applicant",
        type: "varchar",
        length: "36",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      "medical_checks",
      "attachment_photo_applicant"
    );
  }
}
