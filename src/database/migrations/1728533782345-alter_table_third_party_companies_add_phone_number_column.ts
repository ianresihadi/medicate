import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableThirdPartyCompaniesAddPhoneNumberColumn1728533782345
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "third_party_companies",
      new TableColumn({
        name: "phone_number_display",
        type: "varchar",
        length: "20",
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      "third_party_companies",
      new TableColumn({
        name: "phone_number",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      "third_party_companies",
      "phone_number_display"
    );
    await queryRunner.dropColumn("third_party_companies", "phone_number");
  }
}
