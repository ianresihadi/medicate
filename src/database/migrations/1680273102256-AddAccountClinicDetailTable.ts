import {
  Table,
  QueryRunner,
  TableForeignKey,
  MigrationInterface,
} from "typeorm";

export class AddAccountClinicDetailTable1680273102256
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "account_clinic_details",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            generationStrategy: "increment",
            isGenerated: true,
          },
          {
            name: "account_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "clinic_id",
            type: "bigint",
            isNullable: false,
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
            isNullable: false,
            default: "current_timestamp()",
            onUpdate: "current_timestamp()",
          },
        ],
      }),
      true,
      true
    );
    Promise.all([
      queryRunner.createForeignKey(
        "account_clinic_details",
        new TableForeignKey({
          columnNames: ["account_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "accounts",
          onDelete: "restrict",
          onUpdate: "cascade",
        })
      ),
      queryRunner.createForeignKey(
        "account_clinic_details",
        new TableForeignKey({
          columnNames: ["clinic_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "clinics",
          onDelete: "restrict",
          onUpdate: "cascade",
        })
      ),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("account_clinic_details");
  }
}
