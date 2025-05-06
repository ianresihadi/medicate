import { DataSource } from "typeorm";
import { Countries } from "@entities/Countries.entity";
import { Seeder } from "typeorm-extension";
import * as fs from "fs";
import * as path from "path";

export default class PackageMedicalCheckSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    try {
      const countriesRepository = dataSource.getRepository<Countries>(Countries);

      const filePath = path.join(__dirname, "countries.json");
      const list = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      await countriesRepository.save(list)
    } catch (error) {
      console.log("Package medical check seed:", error);
    }
  }
}
