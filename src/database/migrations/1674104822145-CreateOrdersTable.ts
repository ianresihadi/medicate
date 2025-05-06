import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateOrdersTable1674104822145 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "orders",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "medical_check_id",
            type: "bigint",
          },
          {
            name: "virtual_account_number",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "order_code",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["belum bayar", "menunggu", "sudah bayar", "gagal"],
            isNullable: false,
          },
          {
            name: "date",
            type: "date",
            isNullable: false,
          },
          {
            name: "evidance",
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
      "orders",
      new TableForeignKey({
        columnNames: ["medical_check_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "medical_checks",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("orders");
  }
}
