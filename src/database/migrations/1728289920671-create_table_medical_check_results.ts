import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableMedicalCheckResults1728289920671
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "medical_check_results",
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
            name: "medical_check_id",
            type: "bigint",
          },
          {
            name: "lab_attachment",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "external_mcu_code",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "date_of_issue",
            type: "date",
            isNullable: false,
          },
          {
            name: "status_mcu",
            type: "enum",
            enum: ["fit", "unfit"],
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
        foreignKeys: [
          {
            columnNames: ["medical_check_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "medical_checks",
            onDelete: "restrict",
            onUpdate: "cascade",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable("medical_check_results");
  }
}
