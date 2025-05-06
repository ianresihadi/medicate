import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableAttachments1728756433337 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "attachments",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "type",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "content_type",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "path",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "size",
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
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable("attachments");
  }
}
