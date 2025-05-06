import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTablePaymentOrdersAddPaymentMethodId1744180200867 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'payment_orders',
            'bank_id',
            new TableColumn({
                name: 'payment_method_id',
                type: 'bigint',
                isNullable: false
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'payment_orders',
            'payment_method_id',
            new TableColumn({
                name: 'bank_id',
                type: 'bigint',
                isNullable: false,
            })
        )
    }

}
