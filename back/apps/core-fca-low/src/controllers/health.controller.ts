import { ApiEntrepriseService } from "@fc/api-entreprise";
import { RedisService } from "@fc/redis";
import { Controller, Get, HttpStatus, Param, Query, Res } from "@nestjs/common";
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
        throw new Error(`Mongo connection not ready (readyState=${readyState})`);
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
  async readyz(
    @Res() res: Response,
    @Query("verbose") verbose?: string,
    @Query("exclude") exclude?: string | string[],
  ): Promise<void> {
    const excludeSet = new Set(
      Array.isArray(exclude) ? exclude : exclude ? [exclude] : [],
    );

    const results = await this.runChecks(excludeSet);
    const allHealthy = results.every((r) => r.ok || r.excluded);

    const statusCode = allHealthy
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;

    if (verbose !== undefined) {
      const lines = results.map(formatCheckLine);
      res
        .status(statusCode)
        .setHeader("Content-Type", "text/plain")
        .send(
          [...lines, `readyz check ${allHealthy ? "passed" : "failed"}`].join(
            "\n",
          ),
        );
      return;
    }

    res.status(statusCode).send(allHealthy ? "ok" : "error");
  }

  @Get(Routes.HEALTHCHECK_READY_CHECK)
  async readyzCheck(
    @Res() res: Response,
    @Param("check") check: string,
  ): Promise<void> {
    if (!this.checks.hasOwnProperty(check)) {
      res
        .status(HttpStatus.NOT_FOUND)
        .setHeader("Content-Type", "text/plain")
        .send(`readyz check "${check}" not found`);
      return;
    }

    const result = await this.runCheck(check);
    const statusCode = result.ok
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;

    res
      .status(statusCode)
      .setHeader("Content-Type", "text/plain")
      .send(formatCheckLine(result));
  }

  private async runChecks(excludeSet: Set<string>): Promise<CheckResult[]> {
    return Promise.all(
      Object.keys(this.checks).map(async (name) => {
        if (excludeSet.has(name)) {
          return { name, ok: true, excluded: true };
        }
        return this.runCheck(name);
      }),
    );
  }

  private async runCheck(name: string): Promise<CheckResult> {
    try {
      await this.checks[name]();
      return { name, ok: true };
    } catch {
      return { name, ok: false };
    }
  }
}

interface CheckResult {
  name: string;
  ok: boolean;
  excluded?: boolean;
}

function formatCheckLine(result: CheckResult): string {
  if (result.excluded) {
    return `[+]${result.name} excluded: ok`;
  }
  return result.ok ? `[+]${result.name} ok` : `[-]${result.name} failed`;
}
