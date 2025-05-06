import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTablePaymentMethodsAddConfirmPagePaymentInstruction1744303845387 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'payment_methods',
            'payment_instruction',
            'invoice_payment_instruction'
        );
        
        await queryRunner.addColumn(
            'payment_methods',
            new TableColumn({
                name: 'confirm_page_payment_instruction',
                type: 'text',
                isNullable: true
            })
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn(
            'payment_methods',
            'invoice_payment_instruction',
            'payment_instruction'
        );
        
        await queryRunner.dropColumn(
            'payment_methods',
            'confirm_page_payment_instruction'
        );
    }

}
