import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePaymentMethodAndStatusEnumInOrderTable1679650923516
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE orders CHANGE COLUMN payment_method payment_method enum ('CASH', 'EDC', 'ONLINE') NOT NULL DEFAULT 'ONLINE' AFTER order_code"
    );
    await queryRunner.query(
      "ALTER TABLE orders CHANGE COLUMN status status enum ('NOT_PAID', 'WAITING', 'PAID', 'FAILED') NOT NULL DEFAULT 'NOT_PAID' AFTER virtual_account_number"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE orders CHANGE COLUMN payment_method payment_method enum ('cash', 'edc', 'online') NOT NULL DEFAULT 'online' AFTER order_code"
    );
    await queryRunner.query(
      "ALTER TABLE orders CHANGE COLUMN status status enum ('not paid', 'waiting', 'paid', 'failed') NOT NULL AFTER virtual_account_number"
    );
  }
}
