import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTablePaymentOrdersAddProductIdAndStatus1744104587187 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns(
            'payment_orders',
            [
                new TableColumn({
                    name: 'status',
                    type: 'enum',
                    enum: [
                        "INACTIVE",
                        "ACTIVE",
                        "PAID",
                        "EXPIRED",
                    ],
                    isNullable: false,
                    default: '"INACTIVE"'
                }),
                new TableColumn({
                    name: 'virtual_account_number',
                    type: 'varchar',
                    length: "32",
                    isNullable: true,
                }),
            ]
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns(
            'payment_orders',
            [
                'status',
                'virtual_account_number'
            ]
        )
    }

}
