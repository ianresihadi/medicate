import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class alterTableMedicalChecks1728816644053
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_checks", "attachment_identity_card");
    await queryRunner.dropColumn("medical_checks", "attachment_passport");
    await queryRunner.dropColumn(
      "medical_checks",
      "attachment_additional_document"
    );

    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "attachment_identity_card",
        type: "bigint",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "medical_checks",
      new TableForeignKey({
        columnNames: ["attachment_identity_card"],
        referencedTableName: "attachments",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );

    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "attachment_passport",
        type: "bigint",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "medical_checks",
      new TableForeignKey({
        columnNames: ["attachment_passport"],
        referencedTableName: "attachments",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );

    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "attachment_additional_document",
        type: "bigint",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "medical_checks",
      new TableForeignKey({
        columnNames: ["attachment_additional_document"],
        referencedTableName: "attachments",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
}
