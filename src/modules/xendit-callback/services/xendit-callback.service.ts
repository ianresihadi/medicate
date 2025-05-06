import { ResponseInterface } from "@common/interfaces/response.interface";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { XenditCallbackDto, XenditCallbackSuccessDto } from "../dto/xendit-callback.dto";
import { PaymentOrder } from "@entities/payment-order.entity";
import { OrderReceipt } from "@entities/order-receipt.entity";
import { Order } from "@entities/order.entity";
import { EStatusData, PaymentOrderStatus } from "@common/enums/general.enum";
import * as moment from 'moment';

@Injectable()
export class XenditCallbackService {
  constructor(
    @InjectRepository(PaymentOrder)
    private readonly paymentOrderRepository: Repository<PaymentOrder>,
    @InjectRepository(OrderReceipt)
    private readonly orderReceiptRepository: Repository<OrderReceipt>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) { }

  async changeStatusPayment(
    xenditCallbackDto: XenditCallbackDto
  ) {
    try {
      const paymentOrder = await this.paymentOrderRepository.findOne({
        where: {
          transactionId: xenditCallbackDto.id
        }
      })

      if (!paymentOrder)
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Payment order tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);

      const getOrder = await this.orderRepository.findOne({
        where: {
          invoiceId: paymentOrder.invoiceId
        }
      })

      if (!getOrder)
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Order tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);

      await this.paymentOrderRepository.update(
        {
          id: paymentOrder.id
        },
        {
          status: xenditCallbackDto.data.status
        }
      )

      if (getOrder.status == 'pending' && paymentOrder.status == 'ACTIVE') {
        await this.orderRepository.update(
          {
            id: getOrder.id
          },
          {
            status: 'expired'
          }
        )
      }
        

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Status payment order berhasil diubah",
      };

      return responseData
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

  async successPayment(
    xenditCallbackSuccessDto: XenditCallbackSuccessDto
  ) {
    try {
      const paymentOrder = await this.paymentOrderRepository.findOne({
        where: {
          transactionId: xenditCallbackSuccessDto.data.payment_method.id
        }
      })

      if (!paymentOrder)
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Payment order tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);

      const getOrder = await this.orderRepository.findOne({
        where: {
          invoiceId: paymentOrder.invoiceId
        }
      })

      if (!getOrder)
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Order tidak ditemukan",
          error: "Not Found",
        } as ResponseInterface);

      const updatePaymetOrder = this.paymentOrderRepository.update(
        {
          id: paymentOrder.id
        },
        {
          status: PaymentOrderStatus.paid
        }
      )

      const updateData = this.orderRepository.update(
        { id: getOrder.id },
        { status: PaymentOrderStatus.paid }
      );

      const orderReceipt = new OrderReceipt();

      orderReceipt.invoiceId = getOrder.invoiceId;

      const arrReceiptId = getOrder.invoiceId.split("-");

      arrReceiptId[2] = "PAY";

      orderReceipt.receiptId = arrReceiptId.join("-");
      orderReceipt.receiptDate = getOrder.orderDate;
      orderReceipt.createdAt = moment().tz("Asia/Jakarta").toDate();
      orderReceipt.updatedAt = moment().tz("Asia/Jakarta").toDate();

      const insertData = this.orderReceiptRepository.save(orderReceipt);

      await Promise.all([updatePaymetOrder, updateData, insertData]);

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Status payment order berhasil diubah",
      };

      return responseData
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
}
