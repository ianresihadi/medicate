import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTablePaymentMethodsAddVaProduct1744170133798 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns(
            'payment_methods',
            [
                new TableColumn({
                    name: 'administration_fee',
                    type: 'bigint',
                    isNullable: true,
                }),
                new TableColumn({
                    name: 'payment_instruction',
                    type: 'text',
                    isNullable: true
                }),
                new TableColumn({
                    name: 'code',
                    type: 'varchar',
                    length: '32',
                    isNullable: true
                })
            ]
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns(
            'payment_methods',
            [
                'administration_fee',
                'payment_instruction',
                'code',
            ]
        )
    }

}
