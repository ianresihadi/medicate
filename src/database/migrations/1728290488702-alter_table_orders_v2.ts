import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableOrdersV21728290488702 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("orders", "payment_method");
    await queryRunner.dropColumn("orders", "virtual_account_number");
    await queryRunner.dropColumn("orders", "date");

    await queryRunner.changeColumn(
      "orders",
      "status",
      new TableColumn({
        name: "status",
        type: "enum",
        enum: ["pending", "canceled", "paid"],
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
