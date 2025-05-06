import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterTablePackageMedicalCheck1728017969040
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hapus Foreign Key terlebih dahulu
    const table = await queryRunner.getTable("package_medical_check");
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("clinic_id") !== -1
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey("package_medical_check", foreignKey);
    }
    await queryRunner.dropColumn("package_medical_check", "clinic_id");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
