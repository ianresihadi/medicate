import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableMedicalChecksV21728289712836
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "status_approval_consulate",
        type: "enum",
        enum: ["approve", "reject", "pending"],
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_checks", "status_approval_consulate");
  }
}
