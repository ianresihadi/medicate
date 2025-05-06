import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTablePackageMedicalCheckV21728286594158
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "package_medical_check",
      new TableColumn({
        name: "package_medical_check_code",
        type: "varchar",
        length: "100",
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "package_medical_check",
      new TableColumn({
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      "package_medical_check",
      "package_medical_check_code"
    );
    await queryRunner.dropColumn("package_medical_check", "deleted_at");
  }
}
