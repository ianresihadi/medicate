import { MigrationInterface, QueryRunner } from "typeorm";

export class DropRefreshTokenColumnOnAccountTable1676533279533
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("accounts", "refresh_token");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE accounts ADD COLUMN refresh_token VARCHAR(255) NULL AFTER password"
    );
  }
}
