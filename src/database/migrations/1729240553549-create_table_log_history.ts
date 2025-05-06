import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableLogHistory1729240553549 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "log_history",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "method",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "api_uri",
            type: "text",
            isNullable: false,
          },
          {
            name: "request_body",
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
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("log_history");
  }
}
