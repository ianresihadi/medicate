import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAccountTable1674059942175 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "accounts",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "username",
            type: "varchar",
            isUnique: true,
            length: "50",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            length: "80",
            isNullable: false,
          },
          {
            name: "phone_number",
            type: "varchar",
            length: "14",
            isNullable: false,
          },
          {
            name: "password",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "refresh_token",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "role",
            type: "enum",
            enum: [
              "patient",
              "admin_clinic",
              "admin_clinic_lab",
              "third_party",
            ],
            isNullable: false,
          },
          {
            name: "active_status",
            type: "tinyint",
            length: "1",
            default: 1,
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
            isNullable: true,
            onUpdate: "current_timestamp()",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable("accounts");
  }
}
