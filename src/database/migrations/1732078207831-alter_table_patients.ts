import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTablePatients1732078207831 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "agent_phone_number_display",
        type: "varchar",
        length: "20",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("patients", "agent_phone_number_display");
  }
}
