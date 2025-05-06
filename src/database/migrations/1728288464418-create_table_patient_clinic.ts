import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTablePatientClinic1728288464418
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "patient_clinic",
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
        ],
        foreignKeys: [
          {
            columnNames: ["clinic_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "clinics",
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
    queryRunner.dropTable("patient_clinic");
  }
}
