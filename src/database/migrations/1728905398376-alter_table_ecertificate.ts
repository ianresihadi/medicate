import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableEcertificate1728905398376 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "ecertificate",
      new TableColumn({
        name: "file_key",
        type: "varchar",
        length: "255",
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "ecertificate",
      new TableColumn({
        name: "trx_number",
        type: "varchar",
        length: "255",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("ecertificate", "file_key");
    await queryRunner.dropColumn("ecertificate", "trx_number");
  }
}
