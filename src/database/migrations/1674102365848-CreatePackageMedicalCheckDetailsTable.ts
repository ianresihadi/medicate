import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreatePackageMedicalCheckDetailsTable1674102365848
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "package_medical_check_details",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "medical_check_component_id",
            type: "bigint",
          },
          {
            name: "package_medical_check_id",
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
      }),
      true
    );
    await queryRunner.createForeignKey(
      "package_medical_check_details",
      new TableForeignKey({
        columnNames: ["medical_check_component_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "medical_check_components",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
    await queryRunner.createForeignKey(
      "package_medical_check_details",
      new TableForeignKey({
        columnNames: ["package_medical_check_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "package_medical_check",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("package_medical_check_details");
  }
}
