import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddLabRoomIdColumnOnMedicalCheckTable1675000290221
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "medical_checks",
      new TableColumn({
        name: "lab_room_id",
        type: "bigint",
        isNullable: true,
      })
    );
    await queryRunner.query(
      "ALTER TABLE medical_checks CHANGE lab_room_id lab_room_id bigint(20) NULL AFTER patient_id"
    );
    await queryRunner.createForeignKey(
      "medical_checks",
      new TableForeignKey({
        columnNames: ["lab_room_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "lab_rooms",
        onDelete: "restrict",
        onUpdate: "cascade",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("medical_checks", "lab_room_id");
  }
}
