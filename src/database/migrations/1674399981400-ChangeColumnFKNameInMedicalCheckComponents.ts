import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ChangeColumnFKNameInMedicalCheckComponents1674399981400
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "medical_check_components",
      "medical_check_component_id",
      new TableColumn({
        name: "medical_check_component_type_id",
        type: "bigint",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "medical_check_components",
      "medical_check_component_id",
      new TableColumn({
        name: "medical_check_component_id",
        type: "bigint",
      })
    );
  }
}
