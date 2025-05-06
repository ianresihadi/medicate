import { Repository, Brackets, DataSource } from "typeorm";
import { HttpStatus } from "@nestjs/common/enums";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { PaymentBank } from "@entities/payment-bank.entity";

@Injectable()
export class PaymentBankService {
  constructor(
    @InjectRepository(PaymentBank)
    private readonly paymentBankRepository: Repository<PaymentBank>,
  ) {}

  async getPaymentBanks() {
    try {
      const paymentBanks = await this.paymentBankRepository
        .createQueryBuilder("paymentBank")
        .select([
          "paymentBank.id",
          "paymentBank.name",
          "paymentBank.administrationFee",
          "paymentBank.paymentInstruction",
        ])
        .where("paymentBank.isActive = :isActive", {
          isActive: true,
        })
        .getMany();

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: paymentBanks,
      };

      return responseData;
    } catch (error) {
      switch (error.name) {
        case "EntityNotFoundError":
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: "Payment bank tidak ditemukan",
            error: "Not Found",
          } as ResponseInterface);
        default:
          throw error;
      }
    }
  }
}
