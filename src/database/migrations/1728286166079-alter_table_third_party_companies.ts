import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableThirdPartyCompanies1728286166079
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "third_party_companies",
      new TableColumn({
        name: "consulate_code",
        type: "varchar",
        length: "100",
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "third_party_companies",
      new TableColumn({
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("third_party_companies", "consulate_code");
    await queryRunner.dropColumn("third_party_companies", "deleted_at");
  }
}
