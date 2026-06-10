import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../config";
import { AdminUser } from "./entities/AdminUser";
import { Job } from "./entities/Job";
import { Todo } from "./entities/Todo";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: config.databaseUrl,
  entities: [Todo, Job, AdminUser],
  synchronize: true,
  logging: false,
});

let initialized = false;

export async function getDataSource(): Promise<DataSource> {
  if (!initialized) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    initialized = true;
  }
  return AppDataSource;
}
