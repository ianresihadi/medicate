import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnPaymentMethodOnOrdersTable1674611742962
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `orders` ADD `payment_method` enum ('cash', 'online') NOT NULL DEFAULT 'online' AFTER order_code"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("orders", "payment_method");
  }
}
