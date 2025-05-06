import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpStatus, Injectable } from "@nestjs/common";
import { MedicalCheck } from "@entities/medical-check.entity";
import { UserInterface } from "@common/interfaces/user.interface";
import { ResponseInterface } from "@common/interfaces/response.interface";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { MedicalCheckStatusEnum } from "@common/enums/medical-check-status.enum";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRepository: Repository<MedicalCheck>,
    @InjectRepository(AccountClinicDetail)
    private readonly accountClinicDetailRepository: Repository<AccountClinicDetail>
  ) {}

  async getDashboardData(user: UserInterface) {
    try {
      const accountClinicDetail =
        await this.accountClinicDetailRepository.findOne({
          select: ["clinicId"],
          where: {
            accountId: user.id,
          },
        });

      const today = new Date()
        .toLocaleDateString("en-GB")
        .split("/")
        .reverse()
        .join("-");
      const queuePatientTodayQuery = this.medicalCheckRepository.count({
        where: {
          clinicId: accountClinicDetail.clinicId,
          status: MedicalCheckStatusEnum.ON_QUEUE,
          date: today,
        },
      });
      const patientServedTodayQuery = this.medicalCheckRepository.count({
        where: {
          clinicId: accountClinicDetail.clinicId,
          status: MedicalCheckStatusEnum.WAITING_APPROVE,
          date: today,
        },
      });

      const [queuePatientToday, patientServedToday] = await Promise.all([
        queuePatientTodayQuery,
        patientServedTodayQuery,
      ]);

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          queuePatient: queuePatientToday,
          patientServed: patientServedToday,
        },
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }
}
