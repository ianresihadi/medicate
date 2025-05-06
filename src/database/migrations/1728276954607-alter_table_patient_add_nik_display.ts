import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTablePatientAddNikDisplay1728276954607
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "patients",
      "identity_card_number",
      new TableColumn({
        name: "identity_card_number",
        type: "varchar",
        length: "255",
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      "patients",
      "phone_number",
      new TableColumn({
        name: "phone_number",
        type: "varchar",
        length: "255",
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "identity_card_number_display",
        type: "varchar",
        length: "20",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "phone_number_display",
        type: "varchar",
        length: "20",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("patients", "identity_card_number_display");
    await queryRunner.dropColumn("patients", "identity_card_number_display");
  }
}
