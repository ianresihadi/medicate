import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableAdminVfs1732000954152 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "admin_vfs",
      new TableColumn({
        name: "uuid",
        type: "varchar",
        length: "36",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("admin_vfs", "uuid");
  }
}
