import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";
import * as fs from "fs";
import * as path from "path";

export class CreateTableDistricts1727956278562 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "districts",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: "regency_id",
            type: "int",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "alt_name",
            type: "varchar",
            length: "255",
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
      "districts",
      new TableForeignKey({
        columnNames: ["regency_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "regencies",
        onDelete: "cascade",
        onUpdate: "cascade",
      })
    );

    const filePath = path.join(__dirname, "../seeds/districts.json");
    const list = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const item of list) {
      await queryRunner.query(
        `INSERT INTO districts (id, regency_id, name, alt_name, latitude, longitude) VALUES ('${item.id}', '${item.regencyId}',"${item.name}", "${item.altName}", '${item.latitude}', '${item.longitude}')`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("districts");
  }
}
