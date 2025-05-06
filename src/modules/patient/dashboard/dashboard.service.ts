import { Repository } from "typeorm";
import { Patient } from "@entities/patient.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpStatus, Injectable } from "@nestjs/common";
import { MedicalCheck } from "@entities/medical-check.entity";
import { UserInterface } from "@common/interfaces/user.interface";
import { ResponseInterface } from "@common/interfaces/response.interface";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(MedicalCheck)
    private readonly medicalCheckRepository: Repository<MedicalCheck>
  ) {}

  async getDashboardData(user: UserInterface) {
    try {
      const patient = await this.patientRepository.findOne({
        select: ["id"],
      });

      const today = new Date()
        .toLocaleDateString("en-GB")
        .split("/")
        .reverse()
        .join("-");
      const medicalCheckToday = await this.medicalCheckRepository.count({
        where: {
          patientId: patient.id,
          date: today,
        },
      });

      const responseData: ResponseInterface = {
        statusCode: HttpStatus.OK,
        message: "Sukses get data",
        data: {
          medicalCheckToday,
        },
      };

      return responseData;
    } catch (error) {
      throw error;
    }
  }
}
