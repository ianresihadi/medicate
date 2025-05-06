import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { GetDashboardDataDto } from "./dto/get-dashboard-data.dto";
import { Order } from "@entities/order.entity";
import { Patient } from "@entities/patient.entity";
import {
  ResponseInterface,
  ResponsePaginationInterface,
} from "@common/interfaces/response.interface";
import { EMCUStatusResult, EOrderStatus } from "@common/enums/general.enum";
import { MedicalCheckResults } from "@entities/medical-check-results.entity";
import { GetOrderRawData } from "./type/get-order-raw-data.type";
import { GetMcuDoneRawData } from "./type/get-mcu-done-raw-data.type";
import { GetRemainBalanceRawData } from "./type/get-remain-balance-raw-data.type";
import { GetRecapBalanceRawData } from "./type/get-recap-balance-raw-data.type";
import { ClinicTokenHistory } from "@entities/clinic-token-history.entity";
import { GetTotalTopupRawData } from "./type/get-total-top-up-raw-data.type";
import { GetTotalRedeemRawData } from "./type/get-total-redeem-raw-data.type";
import { TCountRaw } from "./type/count-raw.type";
import { GetTotalPrepaidRawData } from "./type/get-total-prepaid-revenue-raw-data.type";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Patient)
    private readonly patientRespository: Repository<Patient>,
    @InjectRepository(ClinicTokenHistory)
    private readonly clinicTokenHistoryRespository: Repository<ClinicTokenHistory>,
    @InjectRepository(MedicalCheckResults)
    private readonly medicalCheckResultRespository: Repository<MedicalCheckResults>,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}

  async getGeneralDashboardData(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponseInterface> {
    const { startDate, endDate, clinicId, isBackdate, medicalPackageId } = getDashboardDataDto;

    const param = {
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null,
    };

    try {
      let order = this.orderRepository
        .createQueryBuilder("order")
        .select('COUNT(order.id)', 'order')
        .where(
          "(:startDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') <= :endDate)",
          param
        )
        .andWhere(
          'clinic.uuid != :clinicExcludeUuid', {
            clinicExcludeUuid: '45b685ab-936c-4476-bd3e-1261143561b9'
          }
        )
        .leftJoin('order.medicalCheck', 'medicalCheck')
        .leftJoin('medicalCheck.packageMedicalCheck', 'packageMedicalCheck')
        .leftJoin('medicalCheck.clinic', 'clinic');

      let paid = this.orderRepository
        .createQueryBuilder("order")
        .select('COUNT(order.id)', 'paid')
        .where("order.status NOT IN (:...status)", {
          status: [EOrderStatus.expired, EOrderStatus.canceled, EOrderStatus.pending],
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') <= :endDate)",
          param
        )
        .andWhere(
          'clinic.uuid != :clinicExcludeUuid', {
            clinicExcludeUuid: '45b685ab-936c-4476-bd3e-1261143561b9'
          }
        )
      .leftJoin('order.medicalCheck', 'medicalCheck')
      .leftJoin('medicalCheck.packageMedicalCheck', 'packageMedicalCheck')
      .leftJoin('medicalCheck.clinic', 'clinic');

      let mcuCost = this.orderRepository
        .createQueryBuilder("order")
        .select('SUM(packageMedicalCheck.price)', 'mcuCost')
        .where("order.status NOT IN (:...status)", {
          status: [EOrderStatus.expired, EOrderStatus.canceled, EOrderStatus.pending],
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') <= :endDate)",
          param
        )
        .andWhere(
          'clinic.uuid != :clinicExcludeUuid', {
            clinicExcludeUuid: '45b685ab-936c-4476-bd3e-1261143561b9'
          }
        )
        .leftJoin('order.medicalCheck', 'medicalCheck')
        .leftJoin('medicalCheck.packageMedicalCheck', 'packageMedicalCheck')
        .leftJoin('medicalCheck.clinic', 'clinic');

      let platformCost = this.orderRepository
        .createQueryBuilder("order")
        .select('SUM(certificateType.price)', 'platformCost')
        .where("order.status NOT IN (:...status)", {
          status: [EOrderStatus.expired, EOrderStatus.canceled, EOrderStatus.pending],
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') <= :endDate)",
          param
        )
        .andWhere(
          'clinic.uuid != :clinicExcludeUuid', {
            clinicExcludeUuid: '45b685ab-936c-4476-bd3e-1261143561b9'
          }
        )
        .leftJoin('order.medicalCheck', 'medicalCheck')
        .leftJoin('medicalCheck.packageMedicalCheck', 'packageMedicalCheck')
        .leftJoin('medicalCheck.certificateType', 'certificateType')
        .leftJoin('medicalCheck.clinic', 'clinic');

      if (clinicId) {
        order = order.andWhere('clinic.uuid = :clinicId', {
          clinicId
        })

        paid = paid.andWhere('clinic.uuid = :clinicId', {
          clinicId
        })

        mcuCost = mcuCost.andWhere('clinic.uuid = :clinicId', {
          clinicId
        })

        platformCost = platformCost.andWhere('clinic.uuid = :clinicId', {
          clinicId
        })
      }
  
      if (isBackdate) {
        order = order.andWhere('order.isBackdate = :isBackdate', {
          isBackdate: isBackdate === 'true' ? true : false
        })

        paid = paid.andWhere('order.isBackdate = :isBackdate', {
          isBackdate: isBackdate === 'true' ? true : false
        })

        mcuCost = mcuCost.andWhere('order.isBackdate = :isBackdate', {
          isBackdate: isBackdate === 'true' ? true : false
        })

        platformCost = platformCost.andWhere('order.isBackdate = :isBackdate', {
          isBackdate: isBackdate === 'true' ? true : false
        })
      }
  
      if (medicalPackageId) {
        order = order.andWhere('packageMedicalCheck.uuid = :medicalPackageId', {
          medicalPackageId
        })

        paid = paid.andWhere('packageMedicalCheck.uuid = :medicalPackageId', {
          medicalPackageId
        })

        mcuCost = mcuCost.andWhere('packageMedicalCheck.uuid = :medicalPackageId', {
          medicalPackageId
        })

        platformCost = platformCost.andWhere('packageMedicalCheck.uuid = :medicalPackageId', {
          medicalPackageId
        })
      }

      order = await order.getRawOne()
      paid = await paid.getRawOne()
      mcuCost = await mcuCost.getRawOne()
      platformCost = await platformCost.getRawOne()

      return {
        statusCode: HttpStatus.OK,
        message: "Berhasil mendapatkan data dashboard umum",
        data: {
          order: parseInt(order['order']),
          paid: parseInt(paid['paid']),
          platformCost: parseInt(platformCost['platformCost']),
          mcuCost: mcuCost['mcuCost']
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getMcuResult(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponseInterface> {
    const { startDate, endDate } = getDashboardDataDto;

    const param = {
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null,
    };

    try {
      const mcuReleaseFit = await this.medicalCheckResultRespository
        .createQueryBuilder("mcr")
        .where("mcr.statusMcu = :statusMcu", {
          statusMcu: EMCUStatusResult.fit,
        })
        .andWhere("order.status IN (:...status)", {
          status: [EOrderStatus.mcu_release, EOrderStatus.certificate_issued],
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') <= :endDate)",
          param
        )
        .leftJoin("mcr.medicalCheck", "medicalCheck")
        .leftJoin("medicalCheck.order", "order")
        .getCount();

      const mcuReleaseUnfit = await this.medicalCheckResultRespository
        .createQueryBuilder("mcr")
        .where("mcr.statusMcu = :statusMcu", {
          statusMcu: EMCUStatusResult.unfit,
        })
        .andWhere("order.status IN (:...status)", {
          status: [EOrderStatus.mcu_release, EOrderStatus.certificate_issued],
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') <= :endDate)",
          param
        )
        .leftJoin("mcr.medicalCheck", "medicalCheck")
        .leftJoin("medicalCheck.order", "order")
        .getCount();

      const certificateReleaseFit = await this.medicalCheckResultRespository
        .createQueryBuilder("mcr")
        .where("mcr.statusMcu = :statusMcu", {
          statusMcu: EMCUStatusResult.fit,
        })
        .andWhere("order.status = :status", {
          status: EOrderStatus.certificate_issued,
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') <= :endDate)",
          param
        )
        .leftJoin("mcr.medicalCheck", "medicalCheck")
        .leftJoin("medicalCheck.order", "order")
        .getCount();

      const certificateReleaseUnfit = await this.medicalCheckResultRespository
        .createQueryBuilder("mcr")
        .where("mcr.statusMcu = :statusMcu", {
          statusMcu: EMCUStatusResult.unfit,
        })
        .andWhere("order.status = :status", {
          status: EOrderStatus.certificate_issued,
        })
        .andWhere(
          "(:startDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(mcr.createdAt, '%Y-%m-%d') <= :endDate)",
          param
        )
        .leftJoin("mcr.medicalCheck", "medicalCheck")
        .leftJoin("medicalCheck.order", "order")
        .getCount();

      return {
        statusCode: HttpStatus.OK,
        message: "Berhasil mendapatkan data dashboard umum",
        data: {
          mcuRelease: {
            fit: mcuReleaseFit,
            unfit: mcuReleaseUnfit,
          },
          certificateIssued: {
            fit: certificateReleaseFit,
            unfit: certificateReleaseUnfit,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getRecapOrder(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponseInterface> {
    const { startDate, endDate, clinicId, isBackdate, medicalPackageId } = getDashboardDataDto;

    const param = {
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null,
    };

    try {
      let queryBuilderOrderType = this.orderRepository
        .createQueryBuilder('order')
        .select('CASE WHEN order.isBackdate = 0 THEN "Backdate" ELSE "Normal" END', 'order_type')
        .addSelect('COUNT(order.id)', 'total')
        .leftJoin('order.medicalCheck', 'medicalCheck')
        .leftJoin('medicalCheck.packageMedicalCheck', 'packageMedicalCheck')
        .leftJoin('medicalCheck.clinic', 'clinic')
        .where(
          "(:startDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') <= :endDate)",
          param
        )
        .andWhere(
          'clinic.uuid != :clinicExcludeUuid', {
            clinicExcludeUuid: '45b685ab-936c-4476-bd3e-1261143561b9'
          }
        )
        .groupBy('order.isBackdate')

      let queryBuilderOrderClinic = this.orderRepository
        .createQueryBuilder("order")
        .select('clinic.name')
        .addSelect('COUNT(order.id)', 'total')
        .where(
          "(:startDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(order.orderDate, '%Y-%m-%d') <= :endDate)",
          param
        )
        .leftJoin('order.medicalCheck', 'medicalCheck')
        .leftJoin('medicalCheck.packageMedicalCheck', 'packageMedicalCheck')
        .leftJoin('medicalCheck.clinic', 'clinic')
        .groupBy('medicalCheck.clinicId')

      if (clinicId) {
        queryBuilderOrderType = queryBuilderOrderType.andWhere('clinic.uuid = :clinicId', {
          clinicId
        })

        queryBuilderOrderClinic = queryBuilderOrderClinic.andWhere('clinic.uuid = :clinicId', {
          clinicId
        })
      }
  
      if (isBackdate) {
        queryBuilderOrderType = queryBuilderOrderType.andWhere('order.isBackdate = :isBackdate', {
          isBackdate: isBackdate === 'true' ? true : false
        })

        queryBuilderOrderClinic = queryBuilderOrderClinic.andWhere('order.isBackdate = :isBackdate', {
          isBackdate: isBackdate === 'true' ? true : false
        })
      }
  
      if (medicalPackageId) {
        queryBuilderOrderType = queryBuilderOrderType.andWhere('packageMedicalCheck.uuid = :medicalPackageId', {
          medicalPackageId
        })

        queryBuilderOrderClinic = queryBuilderOrderClinic.andWhere('packageMedicalCheck.uuid = :medicalPackageId', {
          medicalPackageId
        })
      }

      let orderType = await queryBuilderOrderType.getRawMany()
      let orderClinic = await queryBuilderOrderClinic.getRawMany()

      orderType = orderType.map((element) => {
        element['total'] = parseInt(element['total'])

        return element
      })

      orderClinic = orderClinic.map((element) => {
        element['total'] = parseInt(element['total'])

        return element
      })

      return {
        statusCode: HttpStatus.OK,
        message: "Berhasil mendapatkan data dashboard umum",
        data: {
          orderType: {
            data: orderType,
            total: orderType.reduce((n, {total}) => n + total, 0)
          },
          orderClinic: {
            data: orderClinic,
            total: orderClinic.reduce((n, {total}) => n + total, 0)
          }
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getPendingOrder(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponseInterface> {
    const { clinicId, isBackdate, medicalPackageId } = getDashboardDataDto;

    try {
      let pendingOrderQueryBuilder = this.orderRepository
        .createQueryBuilder('order')
        .select('COUNT(order.id)', 'pendingOrder')
        .leftJoin('order.medicalCheck', 'medicalCheck')
        .leftJoin('medicalCheck.packageMedicalCheck', 'packageMedicalCheck')
        .leftJoin('medicalCheck.clinic', 'clinic')
        .where('order.status = :status', {
          status: EOrderStatus.pending
        })
        .andWhere('DATEDIFF(NOW(), order.orderDate) >= :dateDiff', {
          dateDiff: 7
        })
        .andWhere(
          'clinic.uuid != :clinicExcludeUuid', {
            clinicExcludeUuid: '45b685ab-936c-4476-bd3e-1261143561b9'
          }
        );

      if (clinicId) {
        pendingOrderQueryBuilder = pendingOrderQueryBuilder.andWhere('clinic.uuid = :clinicId', {
          clinicId
        })
      }
  
      if (isBackdate) {
        pendingOrderQueryBuilder = pendingOrderQueryBuilder.andWhere('order.isBackdate = :isBackdate', {
          isBackdate: isBackdate === 'true' ? true : false
        })
      }
  
      if (medicalPackageId) {
        pendingOrderQueryBuilder = pendingOrderQueryBuilder.andWhere('packageMedicalCheck.uuid = :medicalPackageId', {
          medicalPackageId
        })
      }

      const { pendingOrder } = await pendingOrderQueryBuilder.getRawOne()

      return {
        statusCode: HttpStatus.OK,
        message: "Berhasil mendapatkan data dashboard umum",
        data: {
          pendingOrder: parseInt(pendingOrder)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getOrderData(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponsePaginationInterface> {
    const { startDate, endDate, page, limit, isBackdate, medicalPackageId } = getDashboardDataDto;

    const param = {
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null,
    };

    if (isBackdate)
      param['isBackdate'] = isBackdate

    if (medicalPackageId)
      param['medicalPackageId'] = medicalPackageId

    const skip = (page - 1) * limit;

    try {
      const orderData = await this._getOrderData(
        param,
        limit,
        skip
      );

      const countData = await this._countOrderData(
        param
      );

      const totalPages = Math.ceil(countData / limit);

      return {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        count: countData,
        totalPages,
        currentPage: page,
        data: orderData,
      };
    } catch (error) {
      throw error;
    }
  }

  private async _getOrderData(
    param: Object | any,
    limit = 5,
    skip = 0
  ) {
    let query = `
      SELECT 
        c.uuid AS clinic_uuid,
        c.name AS clinic_name,
        SUM(CASE WHEN o.status IN ('canceled') THEN 1 ELSE 0 END) AS order_canceled,
        SUM(CASE WHEN o.status IN ('pending', 'canceled', 'expired') THEN 1 ELSE 0 END) AS order_unpaid,
        SUM(CASE WHEN o.status IN ('paid', 'waiting_mcu_result', 'mcu_release', 'certificate_issued') THEN 1 ELSE 0 END) AS order_paid
      FROM 
        orders o
      LEFT JOIN 
        medical_checks mc ON o.medical_check_id = mc.id
      LEFT JOIN 
        clinics c ON mc.clinic_id = c.id
      LEFT JOIN
        package_medical_check pmc ON mc.package_medical_check_id = pmc.id
      WHERE 
        (? IS NULL OR DATE_FORMAT(o.created_at, '%Y-%m-%d') >= ?)
        AND (? IS NULL OR DATE_FORMAT(o.created_at, '%Y-%m-%d') <= ?)
        AND c.uuid != ?
    `;

    let value = [param.startDate, param.startDate, param.endDate, param.endDate, '45b685ab-936c-4476-bd3e-1261143561b9']

    if (param.hasOwnProperty('isBackdate')) {
      query += `AND o.is_backdate = ?`
      value.push(param.isBackdate ? 1 : 0)
    }
    
    if (param.hasOwnProperty('medicalPackageId')) {
      query += ` AND pmc.uuid = ?`
      value.push(param.medicalPackageId)
    }

    query += `
      GROUP BY 
        mc.clinic_id
      LIMIT ? 
      OFFSET ?;
    `

    value.push(limit, skip)

    const rawOrderData: GetOrderRawData[] = await this.entityManager.query(
      query,
      value
    );

    return rawOrderData.map((val) => {
      return {
        id: val.clinic_uuid,
        clinicName: val.clinic_name,
        order:
          Number(val.order_paid) +
          Number(val.order_unpaid) +
          Number(val.order_canceled),
        paidOrder: Number(val.order_paid),
        unpaidOrder: Number(val.order_unpaid),
        canceledOrder: Number(val.order_canceled),
      };
    });
  }

  private async _countOrderData(
    param: any
  ) {
    let query = `
      SELECT 
        COUNT(*) AS total_data
      FROM (
        SELECT 
          c.uuid
        FROM 
          orders o
        LEFT JOIN 
          medical_checks mc ON o.medical_check_id = mc.id
        LEFT JOIN 
          clinics c ON mc.clinic_id = c.id
        LEFT JOIN
          package_medical_check pmc ON mc.package_medical_check_id = pmc.id
        WHERE 
          (? IS NULL OR DATE_FORMAT(o.created_at, '%Y-%m-%d') >= ?)
          AND (? IS NULL OR DATE_FORMAT(o.created_at, '%Y-%m-%d') <= ?)
          AND c.uuid != ?
    `;

    let value = [
      param.startDate,
      param.startDate,
      param.endDate,
      param.endDate,
      '45b685ab-936c-4476-bd3e-1261143561b9'
    ]

    if (param.hasOwnProperty('isBackdate')) {
      query += `AND o.is_backdate = ?`
      value.push(param.isBackdate ? 1 : 0)
    }
    
    if (param.hasOwnProperty('medicalPackageId')) {
      query += ` AND pmc.uuid = ?`
      value.push(param.medicalPackageId)
    }

    query += `
    GROUP BY 
          mc.clinic_id
      ) AS grouped_clinics;
    `

    const countRaw: TCountRaw[] = await this.entityManager.query(query, value);

    return Number(countRaw[0].total_data);
  }

  async getMcuDone(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponsePaginationInterface> {
    const { startDate, endDate, limit, page } = getDashboardDataDto;

    const param = {
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null,
    };

    const skip = (page - 1) * limit;

    try {
      const mcuDone = await this._getMcuDone(
        param.startDate,
        param.endDate,
        limit,
        skip
      );

      const countData = await this._countMcuDone(
        param.startDate,
        param.endDate
      );

      const totalPages = Math.ceil(countData / limit);

      return {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        count: countData,
        totalPages,
        currentPage: page,
        data: mcuDone,
      };
    } catch (error) {
      throw error;
    }
  }

  private async _getMcuDone(
    startDate: string | null,
    endDate: string | null,
    limit = 5,
    skip = 0
  ) {
    const query = `
      SELECT 
        c.uuid AS clinic_uuid,
        c.name AS clinic_name,
        SUM(CASE WHEN o.status IN ('waiting_mcu_result', 'mcu_release') THEN 1 ELSE 0 END) AS waiting_mcu_result,
        SUM(CASE WHEN o.status = 'certificate_issued' THEN 1 ELSE 0 END) AS certificate_issued
      FROM 
        orders o
      LEFT JOIN 
        medical_checks mc ON o.medical_check_id = mc.id
      LEFT JOIN 
        clinics c ON mc.clinic_id = c.id
      WHERE 
        (? IS NULL OR DATE_FORMAT(o.created_at, '%Y-%m-%d') >= ?)
        AND (? IS NULL OR DATE_FORMAT(o.created_at, '%Y-%m-%d') <= ?)
      GROUP BY 
        mc.clinic_id
      LIMIT ? 
      OFFSET ?;
    `;

    const rawOrderData: GetMcuDoneRawData[] = await this.entityManager.query(
      query,
      [startDate, startDate, endDate, endDate, limit, skip]
    );

    return rawOrderData.map((val) => {
      return {
        id: val.clinic_uuid,
        clinicName: val.clinic_name,
        mcu: Number(val.certificate_issued) + Number(val.waiting_mcu_result),
        waitingMcuResult: Number(val.waiting_mcu_result),
        mcuRelease: Number(val.certificate_issued),
      };
    });
  }

  private async _countMcuDone(
    startDate: string | null,
    endDate: string | null
  ) {
    const query = `
      SELECT 
        COUNT(*) AS total_data
      FROM (
        SELECT 
          c.uuid
        FROM 
          orders o
        LEFT JOIN 
          medical_checks mc ON o.medical_check_id = mc.id
        LEFT JOIN 
          clinics c ON mc.clinic_id = c.id
        WHERE 
          (? IS NULL OR DATE_FORMAT(o.created_at, '%Y-%m-%d') >= ?)
          AND (? IS NULL OR DATE_FORMAT(o.created_at, '%Y-%m-%d') <= ?)
        GROUP BY 
          mc.clinic_id
      ) AS grouped_clinics;
    `;

    const countRaw: TCountRaw[] = await this.entityManager.query(query, [
      startDate,
      startDate,
      endDate,
      endDate,
    ]);

    return Number(countRaw[0].total_data);
  }

  async getRemainBalance(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponsePaginationInterface> {
    const { endDate, page, limit } = getDashboardDataDto;

    const param = {
      endDate: endDate ? endDate : new Date().toISOString().split("T")[0],
    };

    const skip = (page - 1) * limit;

    const remainBalance = await this._getRemainBalance(
      param.endDate,
      limit,
      skip
    );

    const countRemainBalance = await this._countRemainBalance(param.endDate);

    const totalPages = Math.ceil(countRemainBalance / limit);

    return {
      statusCode: HttpStatus.OK,
      message: "Sukses get data",
      count: countRemainBalance,
      currentPage: Number(page),
      totalPages,
      data: remainBalance,
    };
  }

  private async _getRemainBalance(endDate: string | null, limit = 5, skip = 0) {
    const query = `
      SELECT c.uuid, 
        c.name, 
        cth.created_at as latest_created_at, 
        cth.balance_after 
      FROM clinics c
      LEFT JOIN clinic_token_history cth 
        ON cth.clinic_id = c.id
        AND cth.id = (
          SELECT id
          FROM clinic_token_history cth2 
          WHERE clinic_id = c.id 
            AND (DATE_FORMAT(cth.created_at, '%Y-%m-%d') <= ?)
          ORDER BY created_at DESC 
          LIMIT 1
        )
      ORDER BY balance_after DESC 
      LIMIT ?
      OFFSET ?;
    `;

    const rawDetailQuota: GetRemainBalanceRawData[] =
      await this.entityManager.query(query, [endDate, limit, skip]);

    return rawDetailQuota.map((val) => {
      return {
        id: val.uuid,
        clinicName: val.name,
        quota: val.balance_after ? Number(val.balance_after) : 0,
      };
    });
  }

  private async _countRemainBalance(endDate: string | null) {
    const query = `
      SELECT COUNT(c.uuid) AS total_data
      FROM clinics c
      LEFT JOIN clinic_token_history cth 
        ON cth.clinic_id = c.id
        AND cth.id = (
          SELECT id
          FROM clinic_token_history cth2 
          WHERE clinic_id = c.id 
            AND (DATE_FORMAT(cth.created_at, '%Y-%m-%d') <= ?)
          ORDER BY created_at DESC 
          LIMIT 1
        )
      ORDER BY balance_after DESC;
    `;

    const rawCount: TCountRaw[] = await this.entityManager.query(query, [
      endDate,
    ]);

    return Number(rawCount[0].total_data);
  }

  async getRecapBalance(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponsePaginationInterface> {
    const { startDate, endDate, page, limit } = getDashboardDataDto;

    const param = {
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null,
    };

    const skip = (page - 1) * limit;

    const recapBalance = await this._getRecapBalance(
      param.startDate,
      param.endDate,
      limit,
      skip
    );

    const countRecapBalance = await this._countRecapBalance(
      param.startDate,
      param.endDate
    );

    const totalPages = Math.ceil(countRecapBalance / limit);

    return {
      statusCode: HttpStatus.OK,
      message: "Sukses get data",
      count: countRecapBalance,
      currentPage: Number(page),
      totalPages,
      data: recapBalance,
    };
  }

  async _getRecapBalance(
    startDate: string | null,
    endDate: string | null,
    limit = 5,
    skip = 0
  ) {
    const query = `
      SELECT
        c.id, 
        c.uuid, 
        c.name, 
        (
          SELECT cth2.balance_before FROM clinic_token_history cth2 
          WHERE 
            cth2.clinic_id = cth.clinic_id 
            AND (? IS NULL OR DATE_FORMAT(cth2.created_at, '%Y-%m-%d') >= ?)
            AND (? IS NULL OR DATE_FORMAT(cth2.created_at, '%Y-%m-%d') <= ?)
          ORDER BY created_at ASC 
          LIMIT 1
        ) AS balance_before,
        SUM(CASE WHEN cth.description = 'Trigger by add quota action' THEN cth.amount ELSE 0 END) as balance_top_up,
        SUM(CASE WHEN cth.description = 'Trigger by void quota action' THEN cth.amount ELSE 0 END) as balance_void,
        SUM(CASE WHEN cth.description = 'Trigger by paid action' THEN 1 ELSE 0 END) as balance_redeem,
        (
          SELECT cth2.balance_after FROM clinic_token_history cth2 
          WHERE 
            cth2.clinic_id = cth.clinic_id 
            AND (? IS NULL OR DATE_FORMAT(cth2.created_at, '%Y-%m-%d') >= ?)
            AND (? IS NULL OR DATE_FORMAT(cth2.created_at, '%Y-%m-%d') <= ?)
          ORDER BY created_at DESC 
          LIMIT 1
        ) AS balance_after
      FROM clinic_token_history cth 
      LEFT JOIN clinics c ON c.id = cth.clinic_id 
      WHERE 
        (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') >= ?)
        AND (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') <= ?)
      GROUP BY cth.clinic_id
      LIMIT ?
      OFFSET ?;
    `;

    const rawDetailQuota: GetRecapBalanceRawData[] =
      await this.entityManager.query(query, [
        startDate,
        startDate,
        endDate,
        endDate,
        startDate,
        startDate,
        endDate,
        endDate,
        startDate,
        startDate,
        endDate,
        endDate,
        limit,
        skip,
      ]);

    return rawDetailQuota.map((val) => {
      return {
        id: val.uuid,
        name: val.name,
        balanceBefore: val.balance_before ? Number(val.balance_before) : 0,
        balanceAfter: val.balance_after ? Number(val.balance_after) : 0,
        balanceTopUp: Number(val.balance_top_up),
        balanceVoid: Number(val.balance_void),
        balanceRedeem: Number(val.balance_redeem),
      };
    });
  }

  async _countRecapBalance(startDate: string | null, endDate: string | null) {
    const query = `
      SELECT 
        COUNT(*) AS total_data
      FROM (
        SELECT 
          cth.clinic_id
        FROM 
          clinic_token_history cth 
        WHERE 
          (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') >= ?)
          AND (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') <= ?)
        GROUP BY 
          cth.clinic_id
      ) AS grouped_data;    
    `;

    const countDetailQuota: TCountRaw[] = await this.entityManager.query(
      query,
      [startDate, startDate, endDate, endDate]
    );

    return Number(countDetailQuota[0].total_data);
  }

  async getTotalTopup(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponsePaginationInterface> {
    const { startDate, endDate, page, limit } = getDashboardDataDto;

    const skip = (page - 1) * limit;

    const param = {
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null,
    };

    const { sumTotalTopup, mappedTotalTopup } = await this._getTotalTopup(
      param.startDate,
      param.endDate,
      limit,
      skip
    );

    const countTotalTopup = await this._countTotalTopup(
      param.startDate,
      param.endDate
    );

    const totalPages = Math.ceil(countTotalTopup / limit);

    return {
      statusCode: HttpStatus.OK,
      message: "Sukses get data",
      count: countTotalTopup,
      currentPage: Number(page),
      totalPages,
      data: {
        totalTopup: sumTotalTopup,
        clinic: mappedTotalTopup,
      },
    };
  }

  private async _countTotalTopup(
    startDate: string | null,
    endDate: string | null
  ): Promise<number> {
    const query = `
      SELECT 
        COUNT(*) AS total_data
      FROM (
        SELECT 
          c.id
        FROM 
          clinic_token_history cth 
        LEFT JOIN 
          clinics c ON c.id = cth.clinic_id 
        WHERE 
          (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') >= ?)
          AND (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') <= ?)
        GROUP BY 
          cth.clinic_id
      ) AS grouped_data;
    `;

    const countTopupRaw: TCountRaw[] = await this.entityManager.query(query, [
      startDate,
      startDate,
      endDate,
      endDate,
    ]);

    return Number(countTopupRaw[0].total_data);
  }

  private async _getTotalTopup(
    startDate: string | null,
    endDate: string | null,
    limit = 5,
    skip = 0
  ) {
    const query = `
      SELECT 
        c.id, 
        c.uuid, 
        c.name, 
        SUM(CASE WHEN cth.description =  'Trigger by add quota action' THEN cth.amount ELSE 0 END) as balance_top_up,
        SUM(CASE WHEN cth.description = 'Trigger by void quota action' THEN cth.amount ELSE 0 END) as balance_void,
        SUM(CASE WHEN cth.description = 'Trigger by add quota action' THEN cth.amount ELSE 0 END) -
        SUM(CASE WHEN cth.description = 'Trigger by void quota action' THEN cth.amount ELSE 0 END) AS total
      FROM clinic_token_history cth 
      LEFT JOIN clinics c ON c.id = cth.clinic_id 
      WHERE 
        (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') >= ?)
        AND (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') <= ?)
      GROUP BY cth.clinic_id
      ORDER BY total DESC 
      LIMIT ?
      OFFSET ?;        
    `;

    const totalTopupRaw: GetTotalTopupRawData[] =
      await this.entityManager.query(query, [
        startDate,
        startDate,
        endDate,
        endDate,
        limit,
        skip,
      ]);

    let sumTotalTopup = 0;
    const mappedTotalTopup = totalTopupRaw.map((val) => {
      const topupBalance = val.total ? Number(val.total) : 0;
      const totalTopup = 600_000 * topupBalance;
      sumTotalTopup += totalTopup;
      return {
        id: val.uuid,
        clinicName: val.name,
        topupBalance,
        totalTopup,
        balanceTopup: Number(val.balance_top_up),
        balanceVoid: Number(val.balance_void),
      };
    });

    return { sumTotalTopup, mappedTotalTopup };
  }

  async getTotalRedeem(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponsePaginationInterface> {
    const { startDate, endDate, page, limit } = getDashboardDataDto;

    const param = {
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null,
    };

    const skip = (page - 1) * limit;

    const countTotalRedeem = await this._countTotalRedeem(
      param.startDate,
      param.endDate
    );

    const { sumTotalRedeem, mappedTotalRedeem } = await this._getTotalRedeem(
      param.startDate,
      param.endDate,
      limit,
      skip
    );

    const totalPages = Math.ceil(countTotalRedeem / limit);

    return {
      statusCode: HttpStatus.OK,
      message: "Sukses get data",
      count: countTotalRedeem,
      currentPage: Number(page),
      totalPages,
      data: {
        totalRedeem: sumTotalRedeem,
        clinic: mappedTotalRedeem,
      },
    };
  }

  private async _getTotalRedeem(
    startDate: string | null,
    endDate: string | null,
    limit = 5,
    skip = 0
  ) {
    const totalRedeemRaw: GetTotalRedeemRawData[] =
      await this.clinicTokenHistoryRespository
        .createQueryBuilder("cth")
        .select("cth.clinicId")
        .addSelect("clinic.uuid")
        .addSelect("clinic.name")
        .addSelect("COUNT(cth.clinicId)", "total_redeem")
        .leftJoin("cth.clinic", "clinic")
        .where(
          "(:startDate IS NULL OR DATE_FORMAT(cth.createdAt, '%Y-%m-%d') >= :startDate)",
          { startDate }
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(cth.createdAt, '%Y-%m-%d') <= :endDate)",
          { endDate }
        )
        .andWhere("cth.description = 'Trigger by paid action'")
        .groupBy("cth.clinicId")
        .skip(skip)
        .take(limit)
        .getRawMany();

    let sumTotalRedeem = 0;
    const mappedTotalRedeem = totalRedeemRaw.map((val) => {
      const redeemBalance = val.total_redeem ? Number(val.total_redeem) : 0;
      const totalRedeem = 600_000 * redeemBalance;
      sumTotalRedeem += totalRedeem;
      return {
        id: val.clinic_uuid,
        clinicName: val.clinic_name,
        redeemBalance,
        totalRedeem,
      };
    });

    return { sumTotalRedeem, mappedTotalRedeem };
  }

  private async _countTotalRedeem(
    startDate: string | null,
    endDate: string | null
  ) {
    const totalRedeem = await this.clinicTokenHistoryRespository
      .createQueryBuilder("cth")
      .select("cth.clinicId")
      .addSelect("clinic.uuid")
      .addSelect("clinic.name")
      .addSelect("COUNT(cth.clinicId)", "total_redeem")
      .leftJoin("cth.clinic", "clinic")
      .where(
        "(:startDate IS NULL OR DATE_FORMAT(cth.createdAt, '%Y-%m-%d') >= :startDate)",
        { startDate }
      )
      .andWhere(
        "(:endDate IS NULL OR DATE_FORMAT(cth.createdAt, '%Y-%m-%d') <= :endDate)",
        { endDate }
      )
      .andWhere("cth.description = 'Trigger by paid action'")
      .groupBy("cth.clinicId")
      .getCount();

    return totalRedeem;
  }

  async getTotalRevenue(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponseInterface> {
    const { totalTopup } = await this.getPrepaidRevenue(getDashboardDataDto);
    const { totalRedeem } = await this.getGeneratedRevenue(getDashboardDataDto);
    const diff = totalTopup - totalRedeem;

    return {
      statusCode: HttpStatus.OK,
      message: "Sukses get data",
      data: {
        totalTopup,
        totalRedeem,
        diff,
      },
    };
  }

  async getPrepaidRevenue(getDashboardDataDto: GetDashboardDataDto) {
    const { startDate, endDate } = getDashboardDataDto;

    const param = {
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null,
    };

    const query = `
      SELECT SUM(total) as total_sum 
      FROM (
        SELECT 
          SUM(CASE WHEN cth.description = 'Trigger by add quota action' THEN cth.amount ELSE 0 END) - SUM(CASE WHEN cth.description = 'Trigger by void quota action' THEN cth.amount ELSE 0 END) AS total
        FROM clinic_token_history cth 
        WHERE
          (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') >= ?)
          AND (? IS NULL OR DATE_FORMAT(cth.created_at, '%Y-%m-%d') <= ?)
        GROUP BY cth.clinic_id
      ) as grouped_totals;
    `;

    const totalTopupRaw: GetTotalPrepaidRawData[] =
      await this.entityManager.query(query, [
        param.startDate,
        param.startDate,
        param.endDate,
        param.endDate,
      ]);

    const totalTopup = Number(totalTopupRaw[0].total_sum) * 600_000;

    return { totalTopup };
  }

  async getGeneratedRevenue(getDashboardDataDto: GetDashboardDataDto) {
    const { startDate, endDate } = getDashboardDataDto;

    const param = {
      startDate: startDate ? startDate : null,
      endDate: endDate ? endDate : null,
    };

    const totalRedeemRaw: GetTotalRedeemRawData[] =
      await this.clinicTokenHistoryRespository
        .createQueryBuilder("cth")
        .select("cth.clinicId")
        .addSelect("clinic.uuid")
        .addSelect("clinic.name")
        .addSelect("COUNT(cth.clinicId)", "total_redeem")
        .leftJoin("cth.clinic", "clinic")
        .where(
          "(:startDate IS NULL OR DATE_FORMAT(cth.createdAt, '%Y-%m-%d') >= :startDate)",
          param
        )
        .andWhere(
          "(:endDate IS NULL OR DATE_FORMAT(cth.createdAt, '%Y-%m-%d') <= :endDate)",
          param
        )
        .andWhere("cth.description = 'Trigger by paid action'")
        .groupBy("cth.clinicId")
        .getRawMany();

    let sumTotalRedeem = 0;
    totalRedeemRaw.map((val) => {
      const redeemBalance = val.total_redeem ? Number(val.total_redeem) : 0;
      const totalRedeem = 600_000 * redeemBalance;
      sumTotalRedeem += totalRedeem;
    });

    return { totalRedeem: sumTotalRedeem };
  }

  async getRecapCertificateProgress(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponsePaginationInterface> {
    const { startDate, endDate, isBackdate, medicalPackageId, clinicId } = getDashboardDataDto;

    try {
      let certificateProgressQueryBuilder = this.orderRepository
        .createQueryBuilder('order')
        .select('COUNT(order.id)', 'totalCertificateProgress')
        .addSelect('COUNT(CASE WHEN order.status = "certificate_issued" THEN 1 END)', 'totalCertificateIssued')
        .leftJoin('order.medicalCheck', 'medicalCheck')
        .leftJoin('medicalCheck.packageMedicalCheck', 'packageMedicalCheck')
        .leftJoin('medicalCheck.clinic', 'clinic')
        .where('order.status NOT IN (:...status)', {
          status: [
            EOrderStatus.canceled,
            EOrderStatus.pending,
            EOrderStatus.expired
          ]
        })
        .andWhere(
          'clinic.uuid != :clinicExcludeUuid', {
            clinicExcludeUuid: '45b685ab-936c-4476-bd3e-1261143561b9'
          }
        )

      if (startDate) {
        certificateProgressQueryBuilder = certificateProgressQueryBuilder.andWhere("DATE_FORMAT(order.orderDate, '%Y-%m-%d') >= :startDate", {
          startDate
        })
      }

      if (endDate) {
        certificateProgressQueryBuilder = certificateProgressQueryBuilder.andWhere("DATE_FORMAT(order.orderDate, '%Y-%m-%d') <= :endDate", {
          endDate
        })
      }

      if (clinicId) {
        certificateProgressQueryBuilder = certificateProgressQueryBuilder.andWhere('clinic.uuid = :clinicId', {
          clinicId
        })
      }
  
      if (isBackdate) {
        certificateProgressQueryBuilder = certificateProgressQueryBuilder.andWhere('order.isBackdate = :isBackdate', {
          isBackdate: isBackdate === 'true' ? true : false
        })
      }
  
      if (medicalPackageId) {
        certificateProgressQueryBuilder = certificateProgressQueryBuilder.andWhere('packageMedicalCheck.uuid = :medicalPackageId', {
          medicalPackageId
        })
      }

      let {totalCertificateProgress, totalCertificateIssued} = await certificateProgressQueryBuilder.getRawOne()

      return {
        statusCode: HttpStatus.OK,
        message: "Berhasil mendapatkan data certificate progress overview",
        data: {
          totalCertificateProgress: parseInt(totalCertificateProgress),
          totalCertificateIssued: parseInt(totalCertificateIssued),
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async visualizeCertificateProgress(
    getDashboardDataDto: GetDashboardDataDto
  ): Promise<ResponsePaginationInterface> {
    const { startDate, endDate, isBackdate, medicalPackageId, clinicId } = getDashboardDataDto;

    try {
      let certificateProgressQueryBuilder = this.orderRepository
        .createQueryBuilder('order')
        .select('order.status')
        .addSelect('COUNT(order.id)', 'total')
        .leftJoin('order.medicalCheck', 'medicalCheck')
        .leftJoin('medicalCheck.packageMedicalCheck', 'packageMedicalCheck')
        .leftJoin('medicalCheck.clinic', 'clinic')
        .where('order.status NOT IN (:...status)', {
          status: [
            EOrderStatus.canceled,
            EOrderStatus.pending,
            EOrderStatus.expired
          ]
        })
        .andWhere(
          'clinic.uuid != :clinicExcludeUuid', {
            clinicExcludeUuid: '45b685ab-936c-4476-bd3e-1261143561b9'
          }
        )
        .groupBy('order.status')

      if (startDate) {
        certificateProgressQueryBuilder = certificateProgressQueryBuilder.andWhere("DATE_FORMAT(order.orderDate, '%Y-%m-%d') >= :startDate", {
          startDate
        })
      }

      if (endDate) {
        certificateProgressQueryBuilder = certificateProgressQueryBuilder.andWhere("DATE_FORMAT(order.orderDate, '%Y-%m-%d') <= :endDate", {
          endDate
        })
      }

      if (clinicId) {
        certificateProgressQueryBuilder = certificateProgressQueryBuilder.andWhere('clinic.uuid = :clinicId', {
          clinicId
        })
      }
  
      if (isBackdate) {
        certificateProgressQueryBuilder = certificateProgressQueryBuilder.andWhere('order.isBackdate = :isBackdate', {
          isBackdate: isBackdate === 'true' ? true : false
        })
      }
  
      if (medicalPackageId) {
        certificateProgressQueryBuilder = certificateProgressQueryBuilder.andWhere('packageMedicalCheck.uuid = :medicalPackageId', {
          medicalPackageId
        })
      }

      let certificateProgress = await certificateProgressQueryBuilder.getRawMany()

      certificateProgress = certificateProgress.map((element) => {
        element.total = parseInt(element.total)
        return element
      })

      let newCertificateProgress: object[] = [
        {
          order_status: 'paid',
          total: 0
        },
        {
          order_status: 'waiting_mcu_result',
          total: 0
        },
        {
          order_status: 'mcu_release',
          total: 0
        },
        {
          order_status: 'certificate_issued',
          total: 0
        },
      ]

      certificateProgress.forEach(element => {
        switch (element.order_status) {
          case 'paid':
            newCertificateProgress.splice(0, 1, element)
            break;          
          case 'waiting_mcu_result':
            newCertificateProgress.splice(1, 1, element)
            break;          
          case 'mcu_release':
            newCertificateProgress.splice(2, 1, element)
            break;
          case 'certificate_issued':
            newCertificateProgress.splice(3, 1, element)
            break;
          default:
            break;
        }
      });

      return {
        statusCode: HttpStatus.OK,
        message: "Berhasil mendapatkan data certificate progress overview",
        data: {
          certificateProgress: newCertificateProgress,
          total: certificateProgress.reduce((n, {total}) => n + total, 0)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}
