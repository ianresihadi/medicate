import {
  Table,
  TableIndex,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  MigrationInterface,
} from "typeorm";

export class DropColumnThatRelationToAccountInClinicTable1680274212992
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;"
    );
    await queryRunner.dropTable("clinics");
    await queryRunner.createTable(
      new Table({
        name: "clinics",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "uuid",
            type: "varchar",
            length: "36",
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "80",
            isNullable: false,
          },
          {
            name: "address",
            type: "text",
            isNullable: false,
          },
          {
            name: "domicile_city",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "photo",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "document",
            type: "varchar",
            length: "255",
            isNullable: true,
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
      }),
      true
    );
    await queryRunner.createIndex(
      "clinics",
      new TableIndex({
        columnNames: ["uuid"],
      })
    );
    await queryRunner.query("SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.addColumn(
        "clinics",
        new TableColumn({
          name: "admin_clinic_lab_account_id",
          type: "bigint",
        })
      ),
      queryRunner.addColumn(
        "clinics",
        new TableColumn({
          name: "admin_clinic_account_id",
          type: "bigint",
        })
      ),
    ]);
    await Promise.all([
      queryRunner.createForeignKey(
        "clinics",
        new TableForeignKey({
          columnNames: ["admin_clinic_lab_account_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "accounts",
          onDelete: "restrict",
          onUpdate: "cascade",
        })
      ),
      queryRunner.createForeignKey(
        "clinics",
        new TableForeignKey({
          columnNames: ["admin_clinic_account_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "accounts",
          onDelete: "restrict",
          onUpdate: "cascade",
        })
      ),
    ]);
    await Promise.all([
      queryRunner.query(
        "ALTER TABLE `clinics` CHANGE COLUMN `admin_clinic_account_id` `admin_clinic_account_id` BIGINT(20) NOT NULL AFTER `uuid`"
      ),
      queryRunner.query(
        "ALTER TABLE `clinics` CHANGE COLUMN `admin_clinic_lab_account_id` `admin_clinic_lab_account_id` BIGINT(20) NOT NULL AFTER `admin_clinic_account_id`"
      ),
    ]);
  }
}
