import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";
import * as fs from "fs";
import * as path from "path";

export class CreateTableVillages1727956542488 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "villages",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: "district_id",
            type: "bigint",
          },
          {
            name: "name",
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
      "villages",
      new TableForeignKey({
        columnNames: ["district_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "districts",
        onDelete: "cascade",
        onUpdate: "cascade",
      })
    );

    const filePath = path.join(__dirname, "../seeds/villages.json");
    const list = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const item of list) {
      await queryRunner.query(
        `INSERT INTO villages (id, district_id, name, latitude, longitude) VALUES ('${item.id}', '${item.districtId}',"${item.name}", '${item.latitude}', '${item.longitude}')`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("villages");
  }
}
