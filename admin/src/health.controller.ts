import {
  Controller,
  Get,
  Header,
  HttpStatus,
  Query,
  Res,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { type Response } from "express";
import { DataSource } from "typeorm";
import { Configuration } from "./configuration/entity/configuration.mongodb.entity";

@Controller()
export class HealthController {
  constructor(
    @InjectDataSource() private readonly postgresDatabase: DataSource,
    @InjectDataSource("fc-mongo") private readonly mongoDatabase: DataSource,
  ) {}

  checks = {
    postgresDatabase: async () => {
      if (!this.postgresDatabase.isInitialized) {
        throw new Error(
          "PostgreSQL default database connection not initialized",
        );
      }
      await this.postgresDatabase.query("SELECT 1");
    },
    mongoDatabase: async () => {
      if (!this.mongoDatabase.isInitialized) {
        throw new Error("MongoDB fc-mongo connection not initialized");
      }
      await this.mongoDatabase.manager
        .getMongoRepository(Configuration)
        .count();
    },
  };

  @Get("/livez")
  livez(): string {
    return "ok";
  }

  @Get("/readyz")
  @Header("Content-Type", "text/plain")
  async readyz(
    @Res({ passthrough: true }) res: Response,
    @Query("verbose") verbose?: string,
  ): Promise<string> {
    const results = await Promise.all(
      Object.entries(this.checks).map(async ([name, check]) => {
        try {
          await check();
          return { name, status: "success" as const };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : JSON.stringify(error);
          return { name, status: "error" as const, message };
        }
      }),
    );
    const allHealthy = results.every((r) => r.status === "success");

    if (!allHealthy) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    if (verbose !== undefined) {
      const lines = results.map((r) =>
        r.status === "success"
          ? `[+]${r.name} ok`
          : `[-]${r.name} failed (${r.message})`,
      );
      return [
        ...lines,
        `readyz check ${allHealthy ? "passed" : "failed"}`,
      ].join("\n");
    }

    return allHealthy ? "ok" : "error";
  }
}
