import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class createTableClinicPackage1741920741592
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "clinic_packages",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            generationStrategy: "increment",
            isGenerated: true,
          },
          {
            name: "clinic_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "package_medical_check_id",
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
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
      }),
      true,
      true
    );

    Promise.all([
      await queryRunner.createForeignKey(
        "clinic_packages",
        new TableForeignKey({
          columnNames: ["package_medical_check_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "package_medical_check",
          onDelete: "restrict",
          onUpdate: "cascade",
        })
      ),
      queryRunner.createForeignKey(
        "clinic_packages",
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
    await queryRunner.dropTable("clinic_packages");
  }
}
