import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export const connectionSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  migrations: ["./src/database/migrations/*.ts"],
});
