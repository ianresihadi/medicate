import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableAttachment1728815820631 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "attachments",
      new TableColumn({
        name: "uuid",
        type: "varchar",
        length: "36",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("attachments", "uuid");
  }
}
