import { ApiEntrepriseService } from "@fc/api-entreprise";
import { RedisService } from "@fc/redis";
import {
  Controller,
  Get,
  Header,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Res,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { type Response } from "express";
import { Connection } from "mongoose";
import { Routes } from "../enums";

@Controller()
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly redis: RedisService,
    private readonly apiEntreprise: ApiEntrepriseService,
  ) {}

  checks = {
    mongodb: async () => {
      if (this.mongoConnection.readyState !== 1) {
        throw new Error(
          `Mongo connection not ready (readyState=${this.mongoConnection.readyState})`,
        );
      }
    },
    redis: async () => {
      const pong = await this.redis.client.ping();
      if (pong !== "PONG") {
        throw new Error(`unexpected redis client response: ${pong}`);
      }
    },
    // We use DINUM SIRET for the ping route
    "api-entreprise": async () => {
      await this.apiEntreprise.getOrganizationBySiret("13002526500013");
    },
  };

  @Get(Routes.HEALTHCHECK_LIVE)
  livez(): string {
    return "ok";
  }

  @Get(Routes.HEALTHCHECK_READY)
  @Header("Content-Type", "text/plain")
  async readyz(
    @Res({ passthrough: true }) res: Response,
    @Query("verbose") verbose?: string,
    @Query("exclude") exclude?: string | string[],
  ): Promise<string> {
    const excludeSet = new Set(
      Array.isArray(exclude) ? exclude : exclude ? [exclude] : [],
    );

    const results = await this.runChecks(excludeSet);
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
  }

  @Get(Routes.HEALTHCHECK_READY_CHECK)
  @Header("Content-Type", "text/plain")
  async readyzCheck(
    @Res({ passthrough: true }) res: Response,
    @Param("check") check: string,
  ): Promise<string> {
    if (!this.checks.hasOwnProperty(check)) {
      throw new NotFoundException(`readyz check "${check}" not found`);
    }

    const result = await this.runCheck(check);

    if (result.status !== "success") {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return formatCheckLine(result);
  }

  private async runChecks(excludeSet: Set<string>): Promise<CheckResult[]> {
    return Promise.all(
      Object.keys(this.checks).map(async (name) => {
        if (excludeSet.has(name)) {
          return { name, status: "excluded" };
        }
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
      return { error, name, status: "error" };
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
