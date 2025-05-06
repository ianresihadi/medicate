import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTableMedicalCheck1731655057061 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "vfs_status",
        type: "varchar",
        length: "30",
        isNullable: true,
        default: null
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_checks", "vfs_status");
  }
}
