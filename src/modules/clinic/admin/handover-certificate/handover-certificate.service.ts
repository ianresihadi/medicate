import {
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { HandoverCertificateDto } from './dto/handover-certificate.dto'
import {
  ResponseInterface,
} from "@common/interfaces/response.interface";
import { Attachments } from "@entities/attachment.entity";
import { Ecertificate } from "@entities/ecertificate.entity";
import { HandoverCertificate } from "@entities/handover-certificate.entity";
import * as moment from 'moment';

@Injectable()
export class HandoverCertificateService {
  constructor(
    @InjectRepository(Attachments)
    private readonly attachmentRepository: Repository<Attachments>,
    @InjectRepository(Ecertificate)
    private readonly ecertificateRepository: Repository<Ecertificate>,
    private readonly dataSource: DataSource,
  ) {}

  async handoverCertificate(handoverCertificateDto: HandoverCertificateDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const ecertificateRepository =
      queryRunner.manager.getRepository<Ecertificate>(Ecertificate);
    const ecertificate = await ecertificateRepository.findOne({
      where: { uuid: handoverCertificateDto.ecertificate },
    });

    if (!ecertificate) {
      const responseData: ResponseInterface = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Certificate tidak ditemukan",
      };

      return responseData;
    }

    const attachment = await this.attachmentRepository.findOne({
      where: {
        uuid: handoverCertificateDto.attachmentPhoto
      }
    }) 
    
    if (!attachment) {
      const responseData: ResponseInterface = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Attachment tidak ditemukan",
      };

      return responseData;
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        const handoverCertificate = new HandoverCertificate();
        handoverCertificate.certificateId = ecertificate.id;
        handoverCertificate.attachmentId = attachment.id;
        handoverCertificate.createdAt = moment().toDate()
        handoverCertificate.updatedAt = moment().toDate()

        await manager.save(handoverCertificate);
      });

      await queryRunner.commitTransaction();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.CREATED,
        message: "Serah terima sertifikat berhasil",
      };

      return responseData;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
