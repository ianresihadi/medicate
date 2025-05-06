import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class alterTableMedicalChecksAddFkPhotoApplicant1737221426436
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "medical_checks",
      "attachment_photo_applicant",
      new TableColumn({
        name: "attachment_photo_applicant",
        type: "bigint",
        isNullable: true,
      })
    );
    await queryRunner.createForeignKey(
      "medical_checks",
      new TableForeignKey({
        columnNames: ["attachment_photo_applicant"],
        referencedTableName: "attachments",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      "medical_checks",
      "attachment_photo_applicant"
    );
    await queryRunner.changeColumn(
      "medical_checks",
      "attachment_photo_applicant",
      new TableColumn({
        name: "attachment_photo_applicant",
        type: "varchar",
        length: "36",
        isNullable: true,
      })
    );
  }
}
