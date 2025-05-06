import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUniqueConstrainstAtOrderCodeColumInOrderTable1676804356458
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "orders",
      "order_code",
      new TableColumn({
        name: "order_code",
        type: "varchar",
        length: "255",
        isUnique: true,
      })
    );
    await queryRunner.query(
      "ALTER TABLE orders CHANGE COLUMN order_code order_code VARCHAR(255) NOT NULL AFTER medical_check_id"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "orders",
      "order_code",
      new TableColumn({
        name: "order_code",
        type: "varchar",
        length: "255",
      })
    );
    await queryRunner.query(
      "ALTER TABLE orders CHANGE COLUMN order_code order_code VARCHAR(255) NOT NULL AFTER medical_check_id"
    );
  }
}
