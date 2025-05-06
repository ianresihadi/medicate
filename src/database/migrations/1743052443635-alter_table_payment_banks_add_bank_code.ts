import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTablePaymentBanksAddBankCode1743052443635 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'payment_banks',
            new TableColumn({
                name: 'code',
                type: 'varchar',
                length: '32',
                isNullable: true
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'payment_banks',
            'code'
        )
    }

}
