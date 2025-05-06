import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";
import * as fs from "fs";
import * as path from "path";

export class CreateTableRegencies1727955764836 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "regencies",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: "province_id",
            type: "int",
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "alt_name",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "latitude",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "longitude",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "is_deleted",
            type: "boolean",
            default: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "current_timestamp()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            isNullable: true,
            onUpdate: "current_timestamp()",
          },
        ],
      })
    );
    await queryRunner.createForeignKey(
      "regencies",
      new TableForeignKey({
        columnNames: ["province_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "provinces",
        onDelete: "cascade",
        onUpdate: "cascade",
      })
    );

    const filePath = path.join(__dirname, "../seeds/regencies.json");
    const list = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const item of list) {
      await queryRunner.query(
        `INSERT INTO regencies (id, province_id, name, alt_name, latitude, longitude) VALUES ('${item.id}', '${item.provinceId}','${item.name}', '${item.altName}', '${item.latitude}', '${item.longitude}')`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("regencies");
  }
}
