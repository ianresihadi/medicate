import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class alterTableMedicalCheckResults1728878612613
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_check_results", "lab_attachment");

    await queryRunner.addColumn(
      "medical_check_results",
      new TableColumn({
        name: "lab_attachment",
        type: "bigint",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "medical_check_results",
      new TableForeignKey({
        columnNames: ["lab_attachment"],
        referencedTableName: "attachments",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "medical_check_results",
      new TableColumn({
        name: "lab_attachment",
        type: "varchar",
        length: "100",
        isNullable: false,
      })
    );
  }
}
