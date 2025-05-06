import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTableOrdersChangeColumnStatus1744302903141 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "orders",
            "status",
            new TableColumn({
              name: "status",
              type: "enum",
              enum: [
                "pending",
                "canceled",
                "paid",
                "expired",
                "waiting_mcu_result",
                "mcu_release",
                "certificate_issued",
              ],
              isNullable: false,
            })
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
