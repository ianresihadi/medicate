import { EStatusData } from "@common/enums/general.enum";
import { PaymentMethods } from "@entities/payment-methods.entity";
import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";
import * as fs from "fs";
import * as path from "path";

export default class PaymentMethodsSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    try {
      const paymentMethodsRepository =
        dataSource.getRepository<PaymentMethods>(PaymentMethods);

      // await paymentMethodsRepository.save([
      //   {
      //     name: "Cash",
      //     status: EStatusData.active,
      //   },
      // ]);
      // const filePath = path.join(__dirname, "payment-methods.json");
      // const list = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // await paymentMethodsRepository.save(list)

      await paymentMethodsRepository.update(
        {
          code: 'Mandiri'
        },
        {
          orderNumber: 1
        }
      )

      await paymentMethodsRepository.update(
        {
          code: 'Bri'
        },
        {
          orderNumber: 2
        }
      )

      await paymentMethodsRepository.update(
        {
          code: 'Bni'
        },
        {
          orderNumber: 3
        }
      )

      await paymentMethodsRepository.update(
        {
          code: 'Bsi'
        },
        {
          orderNumber: 4
        }
      )

      await paymentMethodsRepository.update(
        {
          name: 'Pembayaran di Faskes'
        },
        {
          orderNumber: 5
        }
      )
    } catch (error) {
      console.log("Package medical check seed:", error);
    }
  }
}
