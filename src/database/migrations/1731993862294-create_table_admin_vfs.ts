import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class createTableAdminVfs1731993862294 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "admin_vfs",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "name",
            type: "varchar",
            length: "80",
            isNullable: false,
          },
          {
            name: "address",
            type: "text",
            isNullable: false,
          },
          {
            name: "phone_number_display",
            type: "varchar",
            length: "20",
            isNullable: true,
          },
          {
            name: "phone_number",
            type: "varchar",
            length: "255",
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
    await queryRunner.dropTable("admin_vfs");
  }
}
