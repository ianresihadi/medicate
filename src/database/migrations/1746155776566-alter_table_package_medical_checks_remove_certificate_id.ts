import { MigrationInterface, QueryRunner } from "typeorm"

export class alterTablePackageMedicalChecksRemoveCertificateId1746155776566 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'package_medical_check',
            'certificate_id'
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
