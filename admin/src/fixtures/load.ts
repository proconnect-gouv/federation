import AppDataSource from "../dataSource";
import { loadUserFixtures } from "./user.fixture";

async function main() {
  console.log("Loading fixtures...");
  await AppDataSource.initialize();

  await loadUserFixtures(AppDataSource);

  await AppDataSource.destroy();
  console.log("Fixtures loaded successfully");
}

main();
