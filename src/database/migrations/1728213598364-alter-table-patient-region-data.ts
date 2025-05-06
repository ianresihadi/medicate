import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class alterTablePatientRegionData1728213598364
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("patients");
    const fkAccount = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("account_id") !== -1
    );

    if (fkAccount) {
      await queryRunner.dropForeignKey("patients", fkAccount);
    }

    await queryRunner.dropColumn("patients", "account_id");
    await queryRunner.dropColumn("patients", "domicile_city");

    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "email",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "phone_number",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "province_id",
        type: "int",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "patients",
      new TableForeignKey({
        columnNames: ["province_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "provinces",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );

    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "regency_id",
        type: "int",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "patients",
      new TableForeignKey({
        columnNames: ["regency_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "regencies",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("patients");
    const fkProvince = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("province_id") !== -1
    );

    if (fkProvince) {
      await queryRunner.dropForeignKey("patients", fkProvince);
    }

    const fkRegency = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("regency_id") !== -1
    );

    if (fkRegency) {
      await queryRunner.dropForeignKey("patients", fkRegency);
    }

    await queryRunner.dropColumn("patients", "province_id");
    await queryRunner.dropColumn("patients", "regency_id");
  }
}
