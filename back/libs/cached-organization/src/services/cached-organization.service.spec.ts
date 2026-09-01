import { ApiEntrepriseService } from "@fc/api-entreprise";
import { ConfigService } from "@fc/config";
import { LoggerService } from "@fc/logger";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import {
  ApiEntrepriseConnectionError,
  ApiEntrepriseInvalidSiret,
} from "@proconnect-gouv/proconnect.api_entreprise/types";
import { Model } from "mongoose";
import { CachedOrganization } from "../schemas";
import { CachedOrganizationService } from "./cached-organization.service";

describe("CachedOrganizationService", () => {
  let service: CachedOrganizationService;
  let model: Model<CachedOrganization>;
  const apiEntrepriseService = {
    getOrganizationBySiret: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };
  const loggerService = {
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CachedOrganizationService,
        {
          provide: LoggerService,
          useValue: loggerService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: ApiEntrepriseService,
          useValue: apiEntrepriseService,
        },
        {
          provide: getModelToken("CachedOrganization"),
          useValue: {
            findOneAndUpdate: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    configService.get.mockReturnValue({
      cachedTTL: 24 * 60 * 60 * 1000, // 24 hours
      cacheTTLWhenApiEntrepriseIsDown: 90 * 24 * 60 * 60 * 1000, // 90 days
    });

    service = module.get<CachedOrganizationService>(CachedOrganizationService);
    model = module.get<Model<CachedOrganization>>(
      getModelToken("CachedOrganization"),
    );
  });

  describe("computeRoles", () => {
    it("should return agent_public role when organization is public service", () => {
      const cachedOrganization = {
        siret: "12345678901234",
        categorieJuridique: "7410", // Groupement d'intérêt public (GIP)
        etatAdministratif: "A",
      } as CachedOrganization;

      const roles = service.computeRoles(cachedOrganization);

      expect(roles).toContain("agent_public");
    });

    it("should return agent_public_territorial role when organization is public service territorial", () => {
      const cachedOrganization = {
        siret: "12345678901234",
        categorieJuridique: "7220", // Département
        etatAdministratif: "A",
      } as CachedOrganization;

      const roles = service.computeRoles(cachedOrganization);

      expect(roles).toContain("agent_public_territorial");
    });

    it("should return agent_public_etat role when organization is public service state", () => {
      const cachedOrganization = {
        siret: "12345678901234",
        categorieJuridique: "4160", // Institution Banque de France
        etatAdministratif: "A",
      } as CachedOrganization;

      const roles = service.computeRoles(cachedOrganization);

      expect(roles).toContain("agent_public_etat");
    });

    it("should return empty roles array when organization is not public service", () => {
      const cachedOrganization = {
        siret: "12345678901234",
        categorieJuridique: "5499",
        etatAdministratif: "A",
      } as CachedOrganization;

      const roles = service.computeRoles(cachedOrganization);

      expect(roles).toEqual([]);
    });
  });

  describe("getCachedOrganizationBySiret", () => {
    it("should return early if cached organization exists and TTL is not expired", async () => {
      const siret = "12345678901234";
      const now = Date.now();
      const storedOrganization = {
        siret,
        libelle: "Test Org",
        updatedAt: new Date(now - 60 * 60 * 1000), // 1 hour ago
      };

      jest.spyOn(model, "findOne").mockResolvedValue(storedOrganization as any);

      await service.getCachedOrganizationBySiret(siret);

      expect(model.findOne).toHaveBeenCalledWith({ siret });
      expect(model.create).not.toHaveBeenCalled();
    });

    it("should update organization if cached data exists but TTL is expired", async () => {
      const siret = "12345678901234";
      const organizationInfo = { siret, libelle: "Updated Org" };
      const expiredDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      jest.spyOn(model, "findOne").mockResolvedValue({
        ...organizationInfo,
        updatedAt: expiredDate,
      } as any);
      jest
        .spyOn(apiEntrepriseService, "getOrganizationBySiret")
        .mockResolvedValue(organizationInfo);
      jest.spyOn(model, "findOneAndUpdate").mockResolvedValue({} as any);

      await service.getCachedOrganizationBySiret(siret);

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { siret },
        { $set: { ...organizationInfo } },
        { returnDocument: "after", upsert: true },
      );
    });

    it("should fall back to cached data when API Entreprise is down and cache is within cacheTTLWhenApiEntrepriseIsDown", async () => {
      const siret = "12345678901234";
      const now = Date.now();
      const storedOrganization = {
        siret,
        libelle: "Test Org",
        updatedAt: new Date(now - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      };

      jest.spyOn(model, "findOne").mockResolvedValue(storedOrganization as any);
      jest
        .spyOn(apiEntrepriseService, "getOrganizationBySiret")
        .mockRejectedValue(
          new ApiEntrepriseConnectionError("API Entreprise is down"),
        );

      const result = await service.getCachedOrganizationBySiret(siret);

      expect(result).toEqual(storedOrganization);
      expect(model.create).not.toHaveBeenCalled();
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw error if getOrganizationBySiret fails with an error other than ApiEntrepriseConnectionError", async () => {
      const siret = "12345678901234";
      const now = Date.now();
      const storedOrganization = {
        siret,
        libelle: "Test Org",
        updatedAt: new Date(now - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      };
      const invalidSiretError = new ApiEntrepriseInvalidSiret(
        "API Entreprise is up but SIRET is invalid",
      );

      jest.spyOn(model, "findOne").mockResolvedValue(storedOrganization as any);
      jest
        .spyOn(apiEntrepriseService, "getOrganizationBySiret")
        .mockRejectedValue(invalidSiretError);

      await expect(service.getCachedOrganizationBySiret(siret)).rejects.toThrow(
        invalidSiretError,
      );

      expect(model.create).not.toHaveBeenCalled();
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw error if API Entreprise is down and cached data is older than cacheTTLWhenApiEntrepriseIsDown", async () => {
      const siret = "12345678901234";
      const now = Date.now();
      const storedOrganization = {
        siret,
        libelle: "Test Org",
        updatedAt: new Date(now - 91 * 24 * 60 * 60 * 1000), // 91 days ago
      };
      const connectionError = new ApiEntrepriseConnectionError(
        "API Entreprise is down",
      );

      jest.spyOn(model, "findOne").mockResolvedValue(storedOrganization as any);
      jest
        .spyOn(apiEntrepriseService, "getOrganizationBySiret")
        .mockRejectedValue(connectionError);

      await expect(service.getCachedOrganizationBySiret(siret)).rejects.toThrow(
        connectionError,
      );
      expect(model.create).not.toHaveBeenCalled();
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw error if cached data does not exist and API Entreprise fails", async () => {
      const connectionError = new ApiEntrepriseConnectionError(
        "API Entreprise is down",
      );

      jest.spyOn(model, "findOne").mockResolvedValue(null);
      jest
        .spyOn(apiEntrepriseService, "getOrganizationBySiret")
        .mockRejectedValue(connectionError);

      await expect(
        service.getCachedOrganizationBySiret("12345678901234"),
      ).rejects.toThrow(connectionError);
      expect(model.create).not.toHaveBeenCalled();
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });
});
