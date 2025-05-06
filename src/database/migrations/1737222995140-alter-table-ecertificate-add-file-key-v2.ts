import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableEcertificateAddFileKeyV21737222995140
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "ecertificate",
      new TableColumn({
        name: "file_key_v2",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("ecertificate", "file_key_v2");
  }
}
