import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterTableClinics1727961561484 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "phone_number",
        type: "varchar",
        isNullable: true,
        length: "20",
      })
    );

    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "pic_name",
        type: "varchar",
        isNullable: true,
        length: "100",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("clinics", "phone_number");
    await queryRunner.dropColumn("clinics", "pic_name");
  }
}
