import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class alterTableClinicsModifyV21728284938621
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "clinic_code",
        type: "varchar",
        length: "20",
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "province_id",
        type: "int",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "clinics",
      new TableForeignKey({
        columnNames: ["province_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "provinces",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );

    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "regency_id",
        type: "int",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "clinics",
      new TableForeignKey({
        columnNames: ["regency_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "regencies",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );

    await queryRunner.changeColumn(
      "clinics",
      "phone_number",
      new TableColumn({
        name: "phone_number",
        type: "varchar",
        length: "255",
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "phone_number_display",
        type: "varchar",
        length: "20",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "token",
        type: "decimal",
        length: "18,2",
        isNullable: false,
        default: 0,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("clinics", "clinic_code");

    const table = await queryRunner.getTable("clinics");
    const fkProvince = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("province_id") !== -1
    );

    if (fkProvince) {
      await queryRunner.dropForeignKey("clinics", fkProvince);
    }

    const fkRegency = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("regency_id") !== -1
    );

    if (fkRegency) {
      await queryRunner.dropForeignKey("clinics", fkRegency);
    }

    await queryRunner.dropColumn("clinics", "province_id");
    await queryRunner.dropColumn("clinics", "regency_id");
    await queryRunner.dropColumn("clinics", "phone_number_display");
    await queryRunner.dropColumn("clinics", "token");
  }
}
