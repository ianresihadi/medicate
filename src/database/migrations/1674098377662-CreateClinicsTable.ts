import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateClinicsTable1674098377662 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "clinics",
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
            name: "domicile_city",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "photo",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "document",
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
      "clinics",
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
    await queryRunner.dropTable("clinics");
  }
}
