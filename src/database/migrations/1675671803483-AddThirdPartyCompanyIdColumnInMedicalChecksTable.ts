import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddThirdPartyCompanyIdColumnInMedicalChecksTable1675671803483
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "third_party_company_id",
        type: "bigint",
        isNullable: true,
      })
    );
    await queryRunner.query(
      "ALTER TABLE `medical_checks` CHANGE third_party_company_id third_party_company_id bigint (20) NULL AFTER patient_id"
    );
    await queryRunner.createForeignKey(
      "medical_checks",
      new TableForeignKey({
        columnNames: ["third_party_company_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "third_party_companies",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_checks", "third_party_company_id");
  }
}
