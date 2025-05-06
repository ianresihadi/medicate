import { DataSource } from "typeorm";
import { Clinic } from "@entities/clinic.entity";
import { LabRoom } from "@entities/lab-room.entity";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

export default class LabRoomSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    seederFactoryManager: SeederFactoryManager
  ): Promise<void> {
    try {
      const clinicRepository = dataSource.getRepository<Clinic>(Clinic);
      const [clinic] = await clinicRepository.find();

      const labRoomRepository = dataSource.getRepository<LabRoom>(LabRoom);
      const labRoomFactory = seederFactoryManager.get(LabRoom);
      for (let index = 0; index < 3; index++) {
        await labRoomRepository.save(
          await labRoomFactory.make({ clinicId: clinic.id })
        );
      }
    } catch (error) {
      console.log("Lab room seed:", error);
    }
  }
}
