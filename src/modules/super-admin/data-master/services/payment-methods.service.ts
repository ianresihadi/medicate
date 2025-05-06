import { ResponseInterface } from "@common/interfaces/response.interface";
import { PaymentMethods } from "@entities/payment-methods.entity";
import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethods)
    private readonly paymentMethodsRepository: Repository<PaymentMethods>
  ) {}

  async getList() {
    try {
      const list = await this.paymentMethodsRepository.find({
        select: ["id", "uuid", "name", "createdAt"],
        where: {
          status: 'active'
        },
        order: {
          orderNumber: 'ASC'
        }
      });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Success",
        data: list.map((item) => ({
          id: item.uuid,
          name: item.name,
          createdAt: item.createdAt,
        })),
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }
}
