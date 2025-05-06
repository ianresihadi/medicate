import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class DropColumnThatRelationToAccountInThirdPartyCompaniesTable1680277826730
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;"
    );
    await queryRunner.dropTable("third_party_companies");
    await queryRunner.createTable(
      new Table({
        name: "third_party_companies",
        columns: [
          {
            name: "id",
            type: "bigint",
            generationStrategy: "increment",
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "uuid",
            type: "varchar",
            length: "36",
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "80",
            isNullable: false,
          },
          {
            name: "address",
            type: "text",
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
            isNullable: true,
            onUpdate: "current_timestamp()",
          },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      "third_party_companies",
      new TableIndex({
        columnNames: ["uuid"],
      })
    );
    await queryRunner.query("SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "third_party_companies",
      new TableColumn({
        name: "account_id",
        type: "bigint",
      })
    );
    await queryRunner.createForeignKey(
      "third_party_companies",
      new TableForeignKey({
        columnNames: ["account_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "accounts",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
    await queryRunner.query(
      "ALTER TABLE `third_party_companies` CHANGE COLUMN `account_id` `account_id` BIGINT(20) NOT NULL AFTER `id`"
    );
  }
}
