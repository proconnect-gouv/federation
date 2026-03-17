import { DataSource } from "typeorm";
import config from "./config/database";

const AppDataSource = new DataSource(config);

export default AppDataSource;
