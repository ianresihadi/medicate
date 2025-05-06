import {
  Table,
  QueryRunner,
  TableForeignKey,
  MigrationInterface,
} from "typeorm";

export class DropColumnHistoryMedicalCheck1676281186307
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("history_medical_check");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "history_medical_check",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "medical_check_id",
            type: "bigint",
          },
          {
            name: "status",
            type: "enum",
            enum: ["diproses", "sedang berjalan", "selesai", "batal"],
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
            isNullable: true,
            onUpdate: "current_timestamp()",
          },
        ],
      }),
      true
    );
    await queryRunner.createForeignKey(
      "history_medical_check",
      new TableForeignKey({
        columnNames: ["medical_check_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "medical_checks",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }
}
