import { OrderStatusEnum } from "@common/enums/order-status.enum";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ChangeEnumValueInOrderTable1674402392646
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "orders",
      "status",
      new TableColumn({
        name: "status",
        type: "enum",
        enum: Object.values(OrderStatusEnum),
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "order",
      "status",
      new TableColumn({
        name: "status",
        type: "enum",
        enum: ["belum bayar", "menunggu", "sudah bayar", "gagal"],
        isNullable: false,
      })
    );
  }
}
