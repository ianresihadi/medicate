import {
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Order } from "@entities/order.entity";
import { PayOrderDto } from "./dto/pay-order.dto";
import { Patient } from "@entities/patient.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderDetail } from "@entities/order-detail.entity";
import { MedicalCheck } from "@entities/medical-check.entity";
import { UserInterface } from "@common/interfaces/user.interface";
import { OrderStatusEnum } from "@common/enums/order-status.enum";
import { ResponseInterface } from "@common/interfaces/response.interface";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRepository: Repository<MedicalCheck>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    private readonly configService: ConfigService
  ) {}

  async getOrder(user: UserInterface) {
    try {
      const [patient] = await this.patientRepository.find({
        select: ["id"],
        take: 1,
      });

      const orders = await this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "order.uuid",
          "order.id",
          "order.orderCode",
          "order.createdAt",
          "order.status",
          "packageMedicalCheck.name",
          "medicalCheck.date",
          "clinic.name",
        ])
        .innerJoin("medicalCheck.order", "order")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .innerJoin("medicalCheck.clinic", "clinic")
        .where("medicalCheck.patientId = :patientId", {
          patientId: patient.id,
        })
        .orderBy("order.id", "DESC")
        .getMany();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: orders.map((order) => {
          const medical_check_date = order.date;
          delete order.date;
          return {
            order_id: order.order.uuid,
            order_number: order.order.id,
            order_code: order.order.orderCode,
            order_status: order.order.status,
            order_date: order.order.createdAt,
            package_medical_check: order.packageMedicalCheck.name,
            clinic_name: order.clinic.name,
            medical_check_date,
          };
        }),
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async getOrderDetail(user: UserInterface, orderUuid: string) {
    try {
      const [patient] = await this.patientRepository.find({
        select: ["id", "identityCardNumber"],
        take: 1,
      });

      const medicalCheck = await this.medicalCheckRepository
        .createQueryBuilder("medicalCheck")
        .select([
          "order.uuid",
          "order.id",
          "order.orderCode",
          "order.status",
          "packageMedicalCheck.name",
          "medicalCheck.uuid",
          "medicalCheck.date",
          "medicalCheck.identityCard",
          "medicalCheck.passport",
          "medicalCheck.additionalDocument",
          "clinic.name",
        ])
        .innerJoin("medicalCheck.order", "order")
        .innerJoin("medicalCheck.packageMedicalCheck", "packageMedicalCheck")
        .innerJoin("medicalCheck.clinic", "clinic")
        .where("medicalCheck.patient_id = :patient_id", {
          patient_id: patient.id,
        })
        .andWhere("order.uuid = :uuid", { uuid: orderUuid })
        .getOneOrFail();

      let orderTotal = 0;
      const orderDetails = await this.orderDetailRepository.find({
        select: ["subTotal"],
        where: { orderId: medicalCheck.order.id },
      });
      orderDetails.forEach((detail) => (orderTotal += detail.subTotal));

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          order_id: medicalCheck.order.uuid,
          order_number: medicalCheck.order.id,
          order_code: medicalCheck.order.orderCode,
          order_status: medicalCheck.order.status,
          order_date: medicalCheck.order.createdAt,
          order_total: orderTotal,
          package_medical_check: medicalCheck.packageMedicalCheck.name,
          clinic_name: medicalCheck.clinic.name,
          medical_check_id: medicalCheck.uuid,
          medical_check_date: medicalCheck.date,
          identity_card: medicalCheck.identityCard
            ? `${this.configService.get<string>("APP_URL")}/public/${
                medicalCheck.identityCard
              }`
            : null,
          passport: medicalCheck.passport
            ? `${this.configService.get<string>("APP_URL")}/public/${
                medicalCheck.passport
              }`
            : null,
          additional_document: medicalCheck.additionalDocument
            ? `${this.configService.get<string>("APP_URL")}/public/${
                medicalCheck.additionalDocument
              }`
            : null,
          name: user.first_name + user.last_name,
          identity_card_number: patient.identityCardNumber,
        },
      };

      return responseData;
    } catch (error) {
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: "Data tidak ditemukan",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    }
  }

  async payOrder(payOrderDto: PayOrderDto) {
    try {
      const order = await this.orderRepository.findOneOrFail({
        where: { id: Number(payOrderDto.virtual_account_number) },
        relations: {
          orderDetails: true,
        },
      });

      let total = 0;
      order.orderDetails.forEach((orderDetail) => {
        total += orderDetail.subTotal;
      });

      if (payOrderDto.total < total) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Pembayaran Anda kurang dari total pembayaran",
          error: "Bad Request",
        } as ResponseInterface);
      }

      await this.orderRepository.update(
        { id: order.id },
        {
          status: OrderStatusEnum.PAID,
        }
      );

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Berhasil membayar pesanan",
      };

      return responseData;
    } catch (error) {
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: "Nomor virtual account tidak ditemukan",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    }
  }
}
