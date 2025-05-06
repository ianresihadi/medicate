import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class alterTableOrderAddIsBackdate1742468914572 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'orders',
            new TableColumn({
                name: 'is_backdate',
                type: 'boolean',
                default: false
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'order',
            'is_backdate'
        )
    }

}
