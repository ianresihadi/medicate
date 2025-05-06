import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreatePatientsTable1674098122123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "patients",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "account_id",
            type: "bigint",
          },
          {
            name: "first_name",
            type: "varchar",
            length: "80",
            isNullable: false,
          },
          {
            name: "last_name",
            type: "varchar",
            length: "80",
            isNullable: false,
          },
          {
            name: "gender",
            type: "enum",
            enum: ["male", "female"],
            isNullable: false,
          },
          {
            name: "identity_card_number",
            type: "char",
            length: "16",
            isNullable: false,
          },
          {
            name: "birth_date",
            type: "date",
            isNullable: false,
          },
          {
            name: "address",
            type: "text",
            isNullable: false,
          },
          {
            name: "domicile_city",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "job",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "photo_profile",
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
        ],
      }),
      true
    );
    await queryRunner.createForeignKey(
      "patients",
      new TableForeignKey({
        columnNames: ["account_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "accounts",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("patients");
  }
}
