import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableAttachment1728814475684 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "attachments",
      new TableColumn({
        name: "file_key",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("attachments", "file_key");
  }
}
