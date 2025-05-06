import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSuperAdminEnumValueInAccountTable1679650027893
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "accounts",
      "role",
      new TableColumn({
        name: "role",
        type: "enum",
        enum: [
          "PATIENT",
          "ADMIN_CLINIC",
          "ADMIN_CLINIC_LAB",
          "THIRD_PARTY",
          "SUPER_ADMIN",
        ],
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "accounts",
      "role",
      new TableColumn({
        name: "role",
        type: "enum",
        enum: ["patient", "admin_clinic", "admin_clinic_lab", "third_party"],
        isNullable: false,
      })
    );
  }
}
