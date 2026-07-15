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

export enum CheckTarget {
  MongoDB = "mongodb",
  PostgreSQL = "postgresql",
}

@Controller("health")
export class HealthController {
  constructor(
    @InjectDataSource("fc-mongo")
    private readonly mongoConnection: DataSource,
    @InjectDataSource() // connexion par défaut (PostgreSQL dans ton app)
    private readonly postgresConnection: DataSource,
  ) {}

  checks = {
    [CheckTarget.MongoDB]: async () => {
      if (!this.mongoConnection.isInitialized) {
        throw new Error("Mongo DataSource not initialized");
      }
    },
    [CheckTarget.PostgreSQL]: async () => {
      if (!this.postgresConnection.isInitialized) {
        throw new Error("PostgreSQL DataSource not initialized");
      }
    },
  };

  @Get("livez")
  livez(): string {
    return "OK";
  }

  @Get("readyz")
  @Header("Content-Type", "text/plain")
  async readyz(
    @Res({ passthrough: true }) res: Response,
    @Query("verbose") verbose?: string,
    exclude: CheckTarget[] = [],
  ): Promise<string> {
    const results = await this.runChecks();
    const allHealthy = results.every((r) => r.status !== "error");

    if (!allHealthy) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    if (verbose !== undefined) {
      const lines = results.map(formatCheckLine);
      return [
        ...lines,
        `readyz check ${allHealthy ? "passed" : "failed"}`,
      ].join("\n");
    }

    return allHealthy ? "ok" : "error";
    return "OK";
  }

  private async runChecks(): Promise<CheckResult[]> {
    return Promise.all(
      Object.keys(this.checks).map(async (name) => {
        return this.runCheck(name);
      }),
    );
  }

  private async runCheck(
    name: string,
  ): Promise<CheckSuccessResult | CheckErrorResult> {
    try {
      await this.checks[name]();
      return { name, status: "success" };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error : new Error(JSON.stringify(error)),
        name,
        status: "error",
      };
    }
  }
}

interface CheckSuccessResult {
  name: string;
  status: "success";
}

interface CheckExcludedResult {
  name: string;
  status: "excluded";
}

interface CheckErrorResult {
  error: Error;
  name: string;
  status: "error";
}

type CheckResult = CheckErrorResult | CheckExcludedResult | CheckSuccessResult;
function formatCheckLine(result: CheckResult): string {
  switch (result.status) {
    case "success":
      return `[+]${result.name} ok`;
    case "excluded":
      return `[+]${result.name} excluded: ok`;
    case "error":
      return `[-]${result.name} failed (${result.error.message})`;
  }
}
