import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableClinicTokenHistory1728285412539
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "clinic_token_history",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "clinic_id",
            type: "bigint",
          },
          {
            name: "type",
            type: "enum",
            enum: ["penambahan", "pengurangan"],
            isNullable: false,
          },
          {
            name: "amount",
            type: "decimal",
            precision: 18,
            scale: 2,
            isNullable: false,
          },
          {
            name: "balance_before",
            type: "decimal",
            precision: 18,
            scale: 2,
            isNullable: false,
          },
          {
            name: "balance_after",
            type: "decimal",
            precision: 18,
            scale: 2,
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
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
        foreignKeys: [
          {
            columnNames: ["clinic_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "clinics",
            onDelete: "restrict",
            onUpdate: "cascade",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable("clinic_token_history");
  }
}
