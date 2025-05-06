import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTablePaymentMethodAddOrderNumber1745906564138 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'payment_methods',
            new TableColumn({
                name: 'order_number',
                type: 'integer',
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.dropColumn(
        //     'payment_methods',
        //     'order_number'
        // );
    }

}
