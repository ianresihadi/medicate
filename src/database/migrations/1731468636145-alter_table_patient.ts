import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTablePatient1731468636145 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "agent_name",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "agent_address",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "agent_phone_number",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      "patients",
      new TableColumn({
        name: "agent_email",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("patients", "agent_email");
    await queryRunner.dropColumn("patients", "agent_phone_number");
    await queryRunner.dropColumn("patients", "agent_address");
    await queryRunner.dropColumn("patients", "agent_name");
  }
}
