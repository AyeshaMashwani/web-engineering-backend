import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import User from "../entities/User.js";
import Result from "../entities/Result.js";

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [User, Result],
  migrations: ["src/migrations/*.js"],
  migrationsTableName: "migrations"
});

export default AppDataSource;