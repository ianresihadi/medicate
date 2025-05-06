import * as dotenv from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions, runSeeders } from "typeorm-extension";

dotenv.config({ path: "./.env" });

export const connectionSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ["./src/entities/*.entity.ts"],
  seeds: ["./src/database/seeds/*.seed.ts"],
  factories: ["./src/database/factories/*.factory.ts"],
} as DataSourceOptions & SeederOptions);

const runSpecificSeeder = async (seederName?: string) => {
  await connectionSource.initialize();

  if (seederName) {
    const { default: SeederClass } = await import(
      `./src/database/seeds/${seederName}.seed.ts`
    );
    await runSeeders(connectionSource, { seeds: [SeederClass] });
  } else {
    await runSeeders(connectionSource);
  }

  process.exit();
};

const seederName = process.argv[2]; // Ambil nama seeder dari argumen CLI
runSpecificSeeder(seederName);
