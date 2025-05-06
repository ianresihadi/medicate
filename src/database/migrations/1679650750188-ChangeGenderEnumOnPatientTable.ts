import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ChangeGenderEnumOnPatientTable1679650750188
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "patients",
      "gender",
      new TableColumn({
        name: "gender",
        type: "enum",
        enum: ["MALE", "FEMALE"],
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "patients",
      "gender",
      new TableColumn({
        name: "gender",
        type: "enum",
        enum: ["male", "female"],
        isNullable: false,
      })
    );
  }
}
