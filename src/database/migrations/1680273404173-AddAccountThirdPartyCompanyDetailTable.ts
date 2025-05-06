import {
  Table,
  QueryRunner,
  TableForeignKey,
  MigrationInterface,
} from "typeorm";

export class AddAccountThirdPartyCompanyDetailTable1680273404173
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "account_third_party_company_details",
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
            name: "third_party_company_id",
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
        ],
      }),
      true,
      true
    );
    Promise.all([
      queryRunner.createForeignKey(
        "account_third_party_company_details",
        new TableForeignKey({
          columnNames: ["account_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "accounts",
          onDelete: "restrict",
          onUpdate: "cascade",
        })
      ),
      queryRunner.createForeignKey(
        "account_third_party_company_details",
        new TableForeignKey({
          columnNames: ["third_party_company_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "third_party_companies",
          onDelete: "restrict",
          onUpdate: "cascade",
        })
      ),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("account_third_party_company_details");
  }
}
