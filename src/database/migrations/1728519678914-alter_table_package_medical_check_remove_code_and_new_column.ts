import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTablePackageMedicalCheckRemoveCodeAndNewColumn1728519678914
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      "package_medical_check",
      "package_medical_check_code"
    );

    await queryRunner.addColumn(
      "package_medical_check",
      new TableColumn({
        name: "description",
        type: "text",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "package_medical_check",
      new TableColumn({
        name: "price",
        type: "varchar",
        length: "100",
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      "package_medical_check",
      new TableColumn({
        name: "status",
        type: "enum",
        enum: ["active", "inactive"],
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "package_medical_check",
      new TableColumn({
        name: "package_medical_check_code",
        type: "varchar",
        length: "100",
        isNullable: false,
      })
    );

    await queryRunner.dropColumn("package_medical_check", "description");
    await queryRunner.dropColumn("package_medical_check", "price");
    await queryRunner.dropColumn("package_medical_check", "status");
  }
}
