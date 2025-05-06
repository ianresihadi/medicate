import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnotherEnumPaymentMethodInOrderTable1676859242235
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE orders CHANGE COLUMN payment_method payment_method enum ('cash', 'edc', 'online') NOT NULL DEFAULT 'online' AFTER order_code"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE orders CHANGE COLUMN payment_method payment_method enum ('cash', 'online') NOT NULL DEFAULT 'online' AFTER order_code"
    );
  }
}
