import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTableOrderAddOrderDate1742483247156 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'orders',
            new TableColumn({
                name: 'order_date',
                type: "timestamp",
                isNullable: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'orders',
            'order_date'
        )
    }

}
