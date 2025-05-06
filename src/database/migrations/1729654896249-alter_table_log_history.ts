import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class alterTableLogHistory1729654896249 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "log_history",
      new TableColumn({
        name: "requested_by",
        type: "bigint",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "log_history",
      new TableColumn({
        name: "token",
        type: "text",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "log_history",
      new TableForeignKey({
        columnNames: ["requested_by"],
        referencedTableName: "accounts",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("log_history", "requested_by");
    await queryRunner.dropColumn("log_history", "token");
  }
}
