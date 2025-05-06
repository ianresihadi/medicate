import { Repository } from "typeorm";
import { HttpStatus } from "@nestjs/common";
import { RoleEnum } from "@common/enums/role.enum";
import { Patient } from "@entities/patient.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { DashboardService } from "./dashboard.service";
import { MedicalCheck } from "@entities/medical-check.entity";
import { PatientMock, MedicalCheckMock } from "@entities/mocks";
import { UserInterface } from "@common/interfaces/user.interface";
import { patientFakeData } from "@entities/fake-data/patient.fake-data";
import { patientAccountFakeData } from "@entities/fake-data/acccount.fake-data";

describe("DashboardService", () => {
  let service: DashboardService;
  let patientRepository: Repository<Patient>;
  let medicalCheckRepository: Repository<MedicalCheck>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Patient),
          useValue: PatientMock,
        },
        {
          provide: getRepositoryToken(MedicalCheck),
          useValue: MedicalCheckMock,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    patientRepository = module.get<Repository<Patient>>(
      getRepositoryToken(Patient)
    );
    medicalCheckRepository = module.get<Repository<MedicalCheck>>(
      getRepositoryToken(MedicalCheck)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getDashboardData()", () => {
    it("Should success get dashboard data for patient", async () => {
      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(patientRepository, "findOne")
        .mockResolvedValueOnce(patientFakeData);
      jest.spyOn(medicalCheckRepository, "count").mockResolvedValueOnce(10);

      const result = await service.getDashboardData(user);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Success get dashboard data");
      expect(result.data).toEqual({
        medicalCheckToday: 10,
      });
      expect(patientRepository.findOne).toHaveBeenCalled();
      expect(medicalCheckRepository.count).toHaveBeenCalled();
    });

    it("Should throw an error because orm throw an error", async () => {
      const user: UserInterface = {
        id: patientAccountFakeData.id,
        role: RoleEnum.PATIENT,
        username: patientAccountFakeData.username,
        address: patientFakeData.address,
        first_name: patientFakeData.first_name,
        last_name: patientFakeData.last_name,
        exp: 120121,
        iat: 100122,
      };

      jest
        .spyOn(patientRepository, "findOne")
        .mockResolvedValueOnce(patientFakeData);
      jest
        .spyOn(medicalCheckRepository, "count")
        .mockRejectedValueOnce(new Error("Error"));

      await expect(service.getDashboardData(user)).rejects.toThrowError();
      expect(patientRepository.findOne).toHaveBeenCalled();
      expect(medicalCheckRepository.count).toHaveBeenCalled();
    });
  });
});
