import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class alterTableClinicTokenHistory1728981137231
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "clinic_token_history",
      new TableColumn({
        name: "created_by",
        type: "bigint",
        isNullable: false,
      })
    );

    await queryRunner.createForeignKey(
      "clinic_token_history",
      new TableForeignKey({
        columnNames: ["created_by"],
        referencedTableName: "accounts",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("clinic_token_history", "created_by");
  }
}
