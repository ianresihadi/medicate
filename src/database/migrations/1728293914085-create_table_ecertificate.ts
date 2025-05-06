import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableEcertificate1728293914085
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "ecertificate",
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
            name: "patient_id",
            type: "bigint",
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
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
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
          {
            columnNames: ["patient_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "patients",
            onDelete: "restrict",
            onUpdate: "cascade",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable("ecertificate");
  }
}
