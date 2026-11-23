import { join } from "path";
import request from "supertest";
import {
  createMaintenanceApp,
  createMaintenanceAppFromConfig,
} from "./maintenance";

describe("createMaintenanceApp", () => {
  const app = createMaintenanceApp({
    urlPrefix: "/api/v2",
    issuer: "https://auth.example.gouv.fr/api/v2",
    viewsPaths: [join(__dirname, "..", "views")],
    staticAssets: [{ path: join(__dirname, "..", "public") }],
    maintenanceDatetime: "mercredi 14 avril <script>alert(1)</script>",
    maintenanceDuration: "une heure",
  });

  it("serves the discovery document for the configured issuer", async () => {
    const { status, body } = await request(app).get(
      "/api/v2/.well-known/openid-configuration",
    );

    expect(status).toBe(200);
    expect(body).toMatchObject({
      issuer: "https://auth.example.gouv.fr/api/v2",
      authorization_endpoint: "https://auth.example.gouv.fr/api/v2/authorize",
      token_endpoint: "https://auth.example.gouv.fr/api/v2/token",
      jwks_uri: "https://auth.example.gouv.fr/api/v2/jwks",
    });
  });

  it.each(["/api/v2/livez", "/api/v2/readyz"])(
    "answers ok on %s",
    async (path) => {
      const { status, text } = await request(app).get(path);

      expect(status).toBe(200);
      expect(text).toBe("ok");
    },
  );

  it("serves static assets", async () => {
    const { status } = await request(app).get("/img/maintenance.svg");

    expect(status).toBe(200);
  });

  it.each([
    ["get", "/api/v2/authorize"],
    ["post", "/api/v2/token"],
    ["get", "/"],
  ] as const)("renders the maintenance page on %s %s", async (method, path) => {
    const { status, headers, text } = await request(app)[method](path);

    expect(status).toBe(200);
    expect(headers["cache-control"]).toBe("no-store");
    expect(headers["content-security-policy"]).toBeDefined();
    expect(text).toContain("Site en maintenance");
    expect(text).toContain("une heure");
  });

  it("escapes configured values", async () => {
    const { text } = await request(app).get("/");

    expect(text).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(text).not.toContain("<script>alert(1)</script>");
  });
});

describe("createMaintenanceAppFromConfig", () => {
  const config = {
    App: {
      urlPrefix: "/api/v2",
      viewsPaths: [".."],
      assetsPaths: [".."],
      assetsDsfrPaths: [
        {
          assetPath: "../../../../node_modules/@gouvfr/dsfr/dist/dsfr",
          prefix: "/dsfr",
        },
      ],
      maintenanceDuration: "deux heures",
    },
    OidcProvider: { issuer: "https://auth.example.gouv.fr/api/v2" },
  };
  const app = createMaintenanceAppFromConfig(
    { get: (path: keyof typeof config) => config[path] } as any,
    __dirname,
  );

  it("uses the configured issuer", async () => {
    const { body } = await request(app).get(
      "/api/v2/.well-known/openid-configuration",
    );

    expect(body.issuer).toBe("https://auth.example.gouv.fr/api/v2");
  });

  it("resolves views and assets paths from the base directory", async () => {
    const page = await request(app).get("/");
    const asset = await request(app).get("/img/maintenance.svg");
    const dsfr = await request(app).get("/dsfr/dsfr.min.css");

    expect(page.text).toContain("deux heures");
    expect(asset.status).toBe(200);
    expect(dsfr.status).toBe(200);
  });
});
