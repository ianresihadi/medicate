import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class ChangeFKColumnInClinicTable1675131599430
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "clinics",
      "account_id",
      new TableColumn({
        name: "admin_clinic_account_id",
        type: "bigint",
      })
    );
    await queryRunner.addColumn(
      "clinics",
      new TableColumn({
        name: "admin_clinic_lab_account_id",
        type: "bigint",
      })
    );
    await queryRunner.query(
      "ALTER TABLE clinics CHANGE admin_clinic_lab_account_id admin_clinic_lab_account_id bigint(20) NOT NULL AFTER admin_clinic_account_id"
    );
    await queryRunner.createForeignKey(
      "clinics",
      new TableForeignKey({
        columnNames: ["admin_clinic_lab_account_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "accounts",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("clinics", "admin_clinic_lab_account_id");
    await queryRunner.changeColumn(
      "clinics",
      "admin_clinic_account_id",
      new TableColumn({
        name: "account_id",
        type: "bigint",
      })
    );
  }
}
