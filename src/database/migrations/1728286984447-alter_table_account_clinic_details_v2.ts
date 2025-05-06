import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class alterTableAccountClinicDetailsV21728286984447
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "account_clinic_details",
      new TableColumn({
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("account_clinic_details", "deleted_at");
  }
}
