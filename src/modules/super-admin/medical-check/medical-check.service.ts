import { MedicalCheck } from "@entities/medical-check.entity";
import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { GetMcuOrderTrackingDto } from "./dto/get-mcu-order-tracking.dto";
import { setFullName } from "@common/helper/string-convertion.helper";
import { EOrderStatus, EOrderStatusV2 } from "@common/enums/general.enum";
import * as Excel from "exceljs";
import * as moment from 'moment';

@Injectable()
export class MedicalCheckService {
  constructor(
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRespository: Repository<MedicalCheck>
  ) {}

  async getMcuOrderTracking(
    getMcuOrderTrackingDto: GetMcuOrderTrackingDto,
    isImport: boolean
  ) {
    const { page, limit, isMcuOrderReconciliation, clinicId, startDate, endDate, status, medicalPackageId, isBackdate, certificateTypeId, paymentMethodId } =
      getMcuOrderTrackingDto;
    const search = getMcuOrderTrackingDto.search?.trim();

    const skip = (page - 1) * limit;

    const param = {
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null,
    };

    try {
      const query = this.medicalCheckRespository
        .createQueryBuilder("medicalCheck")
        .select([
          "medicalCheck.id",
          "medicalCheck.uuid",
          "medicalCheck.travelDestination",
          "order.orderCode",
          "order.orderDate",
          "order.status",
          "order.isBackdate",
          "order.id",
          "order.createdAt",
          "patient.firstName",
          "patient.lastName",
          "patient.address",
          "packageMedicalCheck.name",
          "packageMedicalCheck.price",
          "paymentMethod.name",
          "paymentMethod.administrationFee",
          "certificateType.name",
          "certificateType.price",
          "clinic.name",
        ])
        .where(
          "(:startDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') <= :endDate)",
          param
        )
        .leftJoin("medicalCheck.order", "order")
        .leftJoin("medicalCheck.patient", "patient")
        .leftJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .leftJoin("medicalCheck.clinic", "clinic")
        .leftJoin('medicalCheck.certificateType', 'certificateType')
        .leftJoin('medicalCheck.paymentMethod', 'paymentMethod');
      
      if (clinicId) {
        const allClinicId = clinicId.split(',')

        query.andWhere('clinic.uuid IN (:...clinicId)', {
          clinicId: allClinicId
        })
      }

      if (isImport) {
        query.skip(skip).take(limit);
      }

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere(
              "(clinic.name LIKE :search OR order.orderCode LIKE :search OR packageMedicalCheck.name LIKE :search OR (CONCAT(patient.firstName, ' ', patient.lastName) LIKE :search))",
              {
                search: `%${search}%`,
              }
            );
          })
        );
      }

      if (isMcuOrderReconciliation === 1) {
        query.andWhere("order.status in (:...status)", {
          status: [
            EOrderStatus.paid,
            EOrderStatus.waiting_mcu_result,
            EOrderStatus.mcu_release,
            EOrderStatus.certificate_issued,
          ],
        });
      }

      if (status) {
        const orderStatus = status.split(',')

        query.andWhere('order.status IN (:...status)', {
          status: orderStatus
        })
      }

      if (medicalPackageId) {
        query.andWhere('packageMedicalCheck.uuid = :medicalPackageId', {
          medicalPackageId
        })
      }

      if (isBackdate) {
        query.andWhere('order.isBackdate IS :isBackdate', {
          isBackdate: isBackdate === 'true' ? true : false
        })
      }

      if (certificateTypeId) {
        query.andWhere('certificateType.uuid = :certificateTypeId', {
          certificateTypeId
        })
      }

      if (paymentMethodId) {
        const paymentMethods = paymentMethodId.split(',')

        query.andWhere('paymentMethod.uuid IN (:...paymentMethodId)', {
          paymentMethodId: paymentMethods
        })
      }

      query.orderBy("order.id", "DESC");

      const [row, count] = await query.getManyAndCount();

      const totalPages = Math.ceil(count / limit);

      return {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        count,
        currentPage: page,
        totalPages,
        data: row.map((val) => {
          return {
            id: val.uuid,
            orderCode: val.order?.orderCode,
            orderDate: val.order?.orderDate,
            orderDateString: moment(val.order?.orderDate).format('DD-MM-YYYY'),
            orderStatus: val.order?.status,
            status: EOrderStatusV2[val.order?.status],
            isBackdate: val.order?.isBackdate,
            orderType: val.order?.isBackdate ? 'Backdate' : 'Normal',
            fullName: setFullName(
              val.patient?.firstName,
              val.patient?.lastName
            ),
            address: val.patient?.address,
            packageName: val.packageMedicalCheck?.name,
            packagePrice: Number(val.packageMedicalCheck?.price),
            certificateName: val.certificateType?.name,
            certificatePrice: val.certificateType?.price,
            travelDestination: val.travelDestination,
            paymentMethod: val.paymentMethod?.name,
            paymentAdministrationFee: val.paymentMethod?.administrationFee,
            clinicName: val.clinic?.name,
            orderCreated: moment(val.order?.createdAt).format('DD-MM-YYYY HH:mm:ss')
          };
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  async exportSchedule(getMcuOrderTrackingDto: GetMcuOrderTrackingDto) {
    const { data } = await this.getMcuOrderTracking(
      getMcuOrderTrackingDto,
      false
    );

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Medical Check");

    console.log(data[0])

    worksheet.columns = [
      { header: "Created At", key: "orderCreated", width: 20, font: {bold: true} },
      { header: "Tanggal Order", key: "orderDateString", width: 20, font: {bold: true} },
      { header: "Jenis Order", key: "orderType", width: 10, font: {bold: true} },
      { header: "Status Pesanan", key: "status", width: 20, font: {bold: true} },
      { header: "Nama Pasien", key: "fullName", width: 20, font: {bold: true} },
      { header: "Alamat", key: "address", width: 20, font: {bold: true} },
      { header: "Jenis MCU", key: "packageName", width: 20, font: {bold: true} },
      { header: "Jenis Sertifikat", key: "certificateName", width: 20, font: {bold: true} },
      { header: "Faskes", key: "clinicName", width: 20, font: {bold: true} },
      { header: "Negara Tujuan", key: "travelDestination", width: 20, font: {bold: true} },
      { header: "Biaya MCU", key: "packagePrice", width: 20, font: {bold: true} },
      { header: "Biaya Transaksi", key: "paymentAdministrationFee", width: 20, font: {bold: true} },
      { header: "Harga Sertifikat", key: "certificatePrice", width: 20, font: {bold: true} },
    ];

    let firstCellCol = 'A'

    worksheet.columns.forEach(( element: any, index: number) => {
      if (index > 0) {
        firstCellCol = String.fromCharCode(firstCellCol.charCodeAt(0) + 1)
      }

      worksheet.getCell(`${firstCellCol}1`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: 'ebdb34'
        }
      }      
    });


    worksheet.addRows(data);

    return await workbook.xlsx.writeBuffer();
  }
}
