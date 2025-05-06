import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableMedicalPackageCertificates1745997366113
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "medical_package_certificates",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            generationStrategy: "increment",
            isGenerated: true,
          },
          {
            name: "medical_package_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "certificate_id",
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
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("medical_package_certificates");
  }
}
