import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class createTableAccountAdminVfsDetails1731994499894
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "account_admin_vfs_details",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            generationStrategy: "increment",
            isGenerated: true,
          },
          {
            name: "account_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "admin_Vfs_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "current_timestamp()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            isNullable: false,
            default: "current_timestamp()",
            onUpdate: "current_timestamp()",
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
      }),
      true,
      true
    );

    Promise.all([
      queryRunner.createForeignKey(
        "account_admin_vfs_details",
        new TableForeignKey({
          columnNames: ["account_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "accounts",
          onDelete: "restrict",
          onUpdate: "cascade",
        })
      ),
      queryRunner.createForeignKey(
        "account_admin_vfs_details",
        new TableForeignKey({
          columnNames: ["admin_Vfs_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "admin_vfs",
          onDelete: "restrict",
          onUpdate: "cascade",
        })
      ),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("account_admin_vfs_details");
  }
}
