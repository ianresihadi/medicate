import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableMedicalChecks1728816155893
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_checks", "identity_card");
    await queryRunner.dropColumn("medical_checks", "passport");
    await queryRunner.dropColumn("medical_checks", "additional_document");

    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "attachment_identity_card",
        type: "varchar",
        length: "36",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "attachment_passport",
        type: "varchar",
        length: "36",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "attachment_additional_document",
        type: "varchar",
        length: "36",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "identity_card",
        type: "varchar",
        length: "255",
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "passport",
        type: "varchar",
        length: "255",
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "additional_document",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );

    await queryRunner.dropColumn("medical_checks", "attachment_identity_card");
    await queryRunner.dropColumn("medical_checks", "attachment_passport");
    await queryRunner.dropColumn(
      "medical_checks",
      "attachment_additional_document"
    );
  }
}
