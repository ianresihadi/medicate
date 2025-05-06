import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableCertificateType1742189223072
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "certificate_types",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            generationStrategy: "increment",
            isGenerated: true,
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
            length: "100",
            isNullable: false,
          },
          {
            name: "price",
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("certificate_types");
  }
}
