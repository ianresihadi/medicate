import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTablePaymentMethods1742190404450
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "payment_methods",
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
            name: "name",
            type: "varchar",
            length: "80",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["active", "inactive"],
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
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("payment_methods");
  }
}
