import { ApiEntrepriseService } from "@fc/api-entreprise";
import { RedisService } from "@fc/redis";
import {
  Controller,
  Get,
  Header,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Query,
  Res,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { type Response } from "express";
import { Connection } from "mongoose";
import { Routes } from "../enums";

export enum ExcludeTarget {
  ApiEntreprise = "api-entreprise",
  MongoDB = "mongodb",
  Redis = "redis",
}

@Controller()
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly redis: RedisService,
    private readonly apiEntreprise: ApiEntrepriseService,
  ) {}

  checks = {
    [ExcludeTarget.MongoDB]: async () => {
      if (this.mongoConnection.readyState !== 1) {
        throw new Error(
          `Mongo connection not ready (readyState=${this.mongoConnection.readyState})`,
        );
      }
    },
    [ExcludeTarget.Redis]: async () => {
      const pong = await this.redis.client.ping();
      if (pong !== "PONG") {
        throw new Error(`unexpected redis client response: ${pong}`);
      }
    },
    // We use DINUM SIRET for the ping route
    [ExcludeTarget.ApiEntreprise]: async () => {
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
    @Query("exclude", new ParseEnumPipe(ExcludeTarget, { optional: true }))
    exclude?: ExcludeTarget,
  ): Promise<string> {
    const excludeSet = new Set(exclude ? [exclude] : []);

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
    @Param("check", new ParseEnumPipe(ExcludeTarget)) check: ExcludeTarget,
  ): Promise<string> {
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
