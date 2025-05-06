import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableAccountThirdPartyCompanyDetailsV21728288149876
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "account_third_party_company_details",
      new TableColumn({
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      "account_third_party_company_details",
      "deleted_at"
    );
  }
}
