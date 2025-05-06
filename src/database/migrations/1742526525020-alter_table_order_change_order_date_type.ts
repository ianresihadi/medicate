import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTableOrderChangeOrderDateType1742526525020 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'orders',
            'order_date',
            new TableColumn({
                name: 'order_date',
                type: "timestamp",
                isNullable: true,
                default: "current_timestamp()"
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
