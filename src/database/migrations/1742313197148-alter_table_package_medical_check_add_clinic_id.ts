import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class alterTablePackageMedicalCheckAddClinicId1742313197148
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "package_medical_check",
      new TableColumn({
        name: "clinic_id",
        type: "bigint",
        isNullable: true,
      })
    );
    await queryRunner.createForeignKey(
      "package_medical_check",
      new TableForeignKey({
        columnNames: ["clinic_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "clinics",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
