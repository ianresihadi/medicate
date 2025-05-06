import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ChangeColumStatusInMedicalCheckTable1674233502747
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "medical_checks",
      "status",
      new TableColumn({
        name: "status",
        type: "enum",
        enum: ["on progress", "process", "complete", "declined"],
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "medical_checks",
      "status",
      new TableColumn({
        name: "status",
        type: "enum",
        enum: ["diproses", "sedang berjalan", "selesai", "batal"],
        isNullable: false,
      })
    );
  }
}
