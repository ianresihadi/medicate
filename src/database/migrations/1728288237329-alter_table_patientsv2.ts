import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTablePatientsv21728288237329 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "patient_code",
        type: "varchar",
        length: "100",
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "certificate_number",
        type: "varchar",
        length: "100",
        isNullable: true,
      })
    );

    await queryRunner.dropColumn("patients", "photo_profile");

    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("patients", "patient_code");
    await queryRunner.dropColumn("patients", "certificate_number");
    await queryRunner.dropColumn("patients", "deleted_at");

    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "photo_profile",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );
  }
}
