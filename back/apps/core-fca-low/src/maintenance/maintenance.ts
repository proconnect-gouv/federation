import type { ConfigService } from "#libs/config";
import {
  OidcProviderRoutes,
  type OidcProviderConfig,
} from "#libs/oidc-provider";
import { renderFile } from "ejs";
import express, { type Express } from "express";
import helmet from "helmet";
import { join } from "path";
import type { AppConfig } from "../dto";
import { Routes } from "../enums";
import { buildOpenidConfiguration } from "./openid-configuration";

export interface MaintenanceAppOptions {
  urlPrefix: string;
  issuer: string;
  viewsPaths: string[];
  staticAssets: { path: string; prefix?: string }[];
  maintenancePageDatetime?: string;
  maintenancePageDuration?: string;
}

// Standalone app served instead of the Nest one when `App_MAINTENANCE_MODE`
// is on: no Mongo, Redis or broker, only a discovery document for service
// providers and a maintenance page for users.
export function createMaintenanceApp({
  urlPrefix,
  issuer,
  viewsPaths,
  staticAssets,
  maintenancePageDatetime,
  maintenancePageDuration,
}: MaintenanceAppOptions): Express {
  const app = express();
  const openidConfiguration = buildOpenidConfiguration(issuer);

  app.use(helmet());
  app.engine("ejs", renderFile);
  app.set("view engine", "ejs");
  app.set("views", viewsPaths);

  app.get(
    `${urlPrefix}${OidcProviderRoutes.OPENID_CONFIGURATION}`,
    (_, res) => {
      res.json(openidConfiguration);
    },
  );

  app.get(
    [
      `${urlPrefix}${Routes.HEALTHCHECK_LIVE}`,
      `${urlPrefix}${Routes.HEALTHCHECK_READY}`,
    ],
    (_, res) => {
      res.type("text").send("ok");
    },
  );

  staticAssets.forEach(({ path, prefix = "/" }) => {
    app.use(prefix, express.static(path));
  });

  // 200 like `proconnect-maintenance`. A 503 would be more accurate for
  // clients and monitoring, but some ingresses replace 5xx with their own page.
  app.use((_, res) => {
    res.status(200).set("Cache-Control", "no-store").render("maintenance", {
      maintenancePageDatetime,
      maintenancePageDuration,
    });
  });

  return app;
}

// Resolves views and assets paths like `main.ts` does for the Nest app,
// relative to `baseDir`.
export function createMaintenanceAppFromConfig(
  configService: ConfigService,
  baseDir: string,
): Express {
  const {
    urlPrefix,
    viewsPaths,
    assetsPaths,
    assetsDsfrPaths,
    maintenancePageDatetime,
    maintenancePageDuration,
  } = configService.get<AppConfig>("App");
  const { issuer } = configService.get<OidcProviderConfig>("OidcProvider");

  return createMaintenanceApp({
    urlPrefix,
    issuer,
    maintenancePageDatetime,
    maintenancePageDuration,
    viewsPaths: viewsPaths.map((viewsPath) =>
      join(baseDir, viewsPath, "views"),
    ),
    staticAssets: [
      ...assetsDsfrPaths.map(({ assetPath, prefix }) => ({
        path: join(baseDir, assetPath),
        prefix,
      })),
      ...assetsPaths.map((assetsPath) => ({
        path: join(baseDir, assetsPath, "public"),
      })),
    ],
  });
}
