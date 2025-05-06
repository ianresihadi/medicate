import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTablePaymentBanksAddInstructionPayment1742959028525 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'payment_banks',
            new TableColumn({
                name: 'payment_instruction',
                type: 'text',
                isNullable: true
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'payment_banks',
            'payment_instruction'
        )
    }
}
