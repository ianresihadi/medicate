import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableAccountsV21728286784517 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "accounts",
      new TableColumn({
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
      })
    );

    await queryRunner.dropColumn("accounts", "phone_number");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("accounts", "deleted_at");

    await queryRunner.addColumn(
      "accounts",
      new TableColumn({
        name: "phone_number",
        type: "varchar",
        length: "14",
        isNullable: true,
      })
    );
  }
}
