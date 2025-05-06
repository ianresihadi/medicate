import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTableEcertificateAddIsPrinted1742394634782 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'ecertificate',
            new TableColumn({
                name: 'is_printed',
                type: 'boolean',
                default: false
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'ecertificate',
            'is_printed'
        )
    }

}
