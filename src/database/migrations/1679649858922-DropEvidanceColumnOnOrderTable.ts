import { MigrationInterface, QueryRunner } from "typeorm";

export class DropEvidanceColumnOnOrderTable1679649858922
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("orders", "evidance");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE orders ADD COLUMN evidance varchar(255) NULL AFTER date"
    );
  }
}
