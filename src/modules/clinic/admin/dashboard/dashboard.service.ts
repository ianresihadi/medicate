import { Brackets, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { MedicalCheck } from "@entities/medical-check.entity";
import { UserInterface } from "@common/interfaces/user.interface";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { PatientClinic } from "@entities/patient-clinic.entity";
import { Order } from "@entities/order.entity";
import { EOrderStatus, EOrderStatusV2 } from "@common/enums/general.enum";
import { GetDashboardMedicalDataDto } from "./dto/get-dashboard-medical-check-data.dto";
import { GetDashboardDataDto } from "./dto/get-dashboard-data.dto";
import * as Excel from "exceljs";
import * as moment from 'moment';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRepository: Repository<MedicalCheck>,
    @InjectRepository(AccountClinicDetail)
    private readonly accountClinicDetailRepository: Repository<AccountClinicDetail>,
    @InjectRepository(PatientClinic)
    private readonly patientClinicRepository: Repository<PatientClinic>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>
  ) {}

  async getDashboardData(
    user: UserInterface,
    dashboardDataDto: GetDashboardDataDto
  ) {
    const { startDate, endDate } = dashboardDataDto;

    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      const countRegisteredPatient = this.patientClinicRepository
        .createQueryBuilder("patient")
        .where("patient.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(patient.createdAt, '%Y-%m-%d') >= :startDate)",
          { startDate }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(patient.createdAt, '%Y-%m-%d') <= :endDate)",
          { endDate }
        )
        .getCount();

      const countIncomingOrder = this.orderRepository
        .createQueryBuilder("order")
        .leftJoin("order.medicalCheck", "medicalCheck")
        .where("medicalCheck.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') >= :startDate)",
          { startDate }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') <= :endDate)",
          { endDate }
        )
        .getCount();

      const countPaidOrder = this.orderRepository
        .createQueryBuilder("order")
        .leftJoin("order.medicalCheck", "medicalCheck")
        .where("medicalCheck.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere("order.status IN (:...status)", {
          status: [
            EOrderStatus.paid,
            EOrderStatus.waiting_mcu_result,
            EOrderStatus.certificate_issued,
            EOrderStatus.certificate_issued,
          ],
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') >= :startDate)",
          { startDate }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') <= :endDate)",
          { endDate }
        )
        .getCount();

      const countMcuDone = this.orderRepository
        .createQueryBuilder("order")
        .leftJoin("order.medicalCheck", "medicalCheck")
        .where("medicalCheck.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere("order.status = :status", {
          status: EOrderStatus.mcu_release,
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') >= :startDate)",
          { startDate }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') <= :endDate)",
          { endDate }
        )
        .getCount();

      const countCertificateIssued = this.orderRepository
        .createQueryBuilder("order")
        .leftJoin("order.medicalCheck", "medicalCheck")
        .where("medicalCheck.clinicId = :clinicId", {
          clinicId: accountClinicDetail.clinicId,
        })
        .andWhere("order.status = :status", {
          status: EOrderStatus.certificate_issued,
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') >= :startDate)",
          { startDate }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.createdAt, '%Y-%m-%d') <= :endDate)",
          { endDate }
        )
        .getCount();

      const [
        registeredPatient,
        incomingOrder,
        paidOrder,
        mcuDone,
        certificate_issued,
      ] = await Promise.all([
        countRegisteredPatient,
        countIncomingOrder,
        countPaidOrder,
        countMcuDone,
        countCertificateIssued,
      ]);

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          registeredPatient,
          incomingOrder,
          paidOrder,
          mcuDone,
          certificate_issued,
        },
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getDashboardMedicalCheckData(
    user: UserInterface,
    getDashboardMedicalDataDto: GetDashboardMedicalDataDto
  ) {
    const { page, limit, startDate, endDate, status, medicalPackageId, isBackdate, certificateTypeId, paymentMethodId } = getDashboardMedicalDataDto;

    try {
      const skip = (page - 1) * limit;
      const search = getDashboardMedicalDataDto.search?.trim();

      const accountClinicDetail = await this.accountClinicDetailRepository
        .createQueryBuilder("accountClinicDetail")
        .innerJoin("accountClinicDetail.clinic", "clinic")
        .select(["accountClinicDetail.id", "clinic.id", "clinic.name"])
        .where("accountClinicDetail.accountId = :accountId", {
          accountId: user.id,
        })
        .getOne();

      if (!accountClinicDetail) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Data klinik tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);
      }

      const query = this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .withDeleted()
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
        .leftJoin("medicalCheck.clinic", "clinic")
        .leftJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .leftJoin("medicalCheck.order", "order")
        .leftJoin("medicalCheck.patient", "patient")
        .leftJoin("medicalCheck.paymentMethod", "paymentMethod")
        .leftJoin("medicalCheck.certificateType", "certificateType")
        .where("medicalCheck.clinic_id = :clinicId", {
          clinicId: accountClinicDetail.clinic.id,
        })
        // .andWhere("order.status IN (:...status)", {
        //   status: [
        //     EOrderStatus.pending,
        //     EOrderStatus.canceled,
        //     EOrderStatus.paid,
        //     EOrderStatus.expired,
        //   ],
        // })
        .skip(skip)
        .take(limit);

      if (startDate) {
        query.andWhere(
          "DATE_FORMAT(order.createdAt, '%Y-%m-%d') >= :startDate",
          {
            startDate,
          }
        );
      }

      if (endDate) {
        query.andWhere("DATE_FORMAT(order.createdAt, '%Y-%m-%d') <= :endDate", {
          endDate,
        });
      }

      if (search) {
        query.andWhere(
          new Brackets((q) => {
            q.orWhere(
              "CONCAT(patient.firstName, ' ', patient.lastName) LIKE :search",
              {
                search: `%${search}%`,
              }
            )
              .orWhere("patient.address LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("order.orderCode LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("packageMedicalCheck.name LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("paymentMethod.name LIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("certificateType.name LIKE :search", {
                search: `%${search}%`,
              });
          })
        );
      }

      if (status) {
        const statusOrder = status.split(',')

        query.andWhere('order.status IN (:...status)', {
          status: statusOrder
        })
      }

      if (medicalPackageId) {
        query.andWhere('packageMedicalCheck.uuid = :medicalPackageId', {
          medicalPackageId
        })
      }

      if (isBackdate) {
        query.andWhere('order.isBackdate = :isBackdate', {
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

      const responseData: ResponsePaginationInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: row.map((medicalCheck) => ({
          id: medicalCheck.uuid,
          name: `${medicalCheck.patient?.firstName} ${medicalCheck.patient?.lastName}`,
          address: medicalCheck.patient?.address,
          order_number: medicalCheck.order.id,
          order_code: medicalCheck.order.orderCode,
          order_status: medicalCheck.order.status,
          status: EOrderStatusV2[medicalCheck.order?.status],
          order_date: medicalCheck.order.orderDate,
          order_created_at: moment(medicalCheck.order.createdAt).format('DD-MM-YYYY HH:mm:ss'),
          order_type: medicalCheck.order?.isBackdate ? 'Backdate' : 'Normal',
          package_medical_check: medicalCheck.packageMedicalCheck?.name,
          package_medical_check_price: medicalCheck.packageMedicalCheck?.price,
          medical_check_date: medicalCheck.date,
          clinic_name: accountClinicDetail.clinic?.name,
          payment_method: medicalCheck.paymentMethod?.name,
          payment_administration_fee: medicalCheck.paymentMethod?.administrationFee,
          certificate_type: medicalCheck.certificateType?.name,
          certificate_price: medicalCheck.certificateType?.price,
          travel_destination: medicalCheck.travelDestination,
        })),
        count,
        currentPage: Number(page),
        totalPages,
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async exportSchedule(
    user: UserInterface,
    getDashboardMedicalDataDto: GetDashboardMedicalDataDto
  ) {
    const { data } = await this.getDashboardMedicalCheckData(
      user,
      getDashboardMedicalDataDto,
    );

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Medical Check");

    console.log(data[0])

    worksheet.columns = [
      { header: "Created At", key: "order_created_at", width: 20, font: {bold: true} },
      { header: "Tanggal Order", key: "order_date", width: 20, font: {bold: true} },
      { header: "Jenis Order", key: "order_type", width: 10, font: {bold: true} },
      { header: "Status Pesanan", key: "status", width: 20, font: {bold: true} },
      { header: "Nama Pasien", key: "name", width: 20, font: {bold: true} },
      { header: "Alamat", key: "address", width: 20, font: {bold: true} },
      { header: "Jenis MCU", key: "package_medical_check", width: 20, font: {bold: true} },
      { header: "Jenis Sertifikat", key: "certificate_type", width: 20, font: {bold: true} },
      { header: "Faskes", key: "clinic_name", width: 20, font: {bold: true} },
      { header: "Negara Tujuan", key: "travel_destination", width: 20, font: {bold: true} },
      { header: "Biaya MCU", key: "package_medical_check_price", width: 20, font: {bold: true} },
      { header: "Biaya Transaksi", key: "payment_administration_fee", width: 20, font: {bold: true} },
      { header: "Harga Sertifikat", key: "certificate_price", width: 20, font: {bold: true} },
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
