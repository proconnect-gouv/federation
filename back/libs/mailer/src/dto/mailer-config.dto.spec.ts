import { validateDto } from "@fc/common";
import { TransportType } from "../enums/transport-type.enum";
import { MailerConfig } from "./mailer-config.dto";

const DTO_VALIDATION_OPTIONS = {
  forbidNonWhitelisted: true,
};

describe("MailerConfig (Data Transfer Object)", () => {
  const mailerConfigMock = {
    fromEmail: "no-reply@example.com",
    fromName: "ProConnect",
  };

  describe("should validate", () => {
    it("with no transport configured", async () => {
      const result = await validateDto(
        mailerConfigMock,
        MailerConfig,
        DTO_VALIDATION_OPTIONS,
      );
      expect(result).toEqual([]);
    });

    it("with brevo transport and brevoApiKey", async () => {
      const result = await validateDto(
        {
          ...mailerConfigMock,
          transport: TransportType.BREVO,
          brevoApiKey: "brevo-key",
        },
        MailerConfig,
        DTO_VALIDATION_OPTIONS,
      );
      expect(result).toEqual([]);
    });

    it("with smtp transport and smtpUrl", async () => {
      const result = await validateDto(
        {
          ...mailerConfigMock,
          transport: TransportType.SMTP,
          smtpUrl: "smtp://mail.example.com:587",
        },
        MailerConfig,
        DTO_VALIDATION_OPTIONS,
      );
      expect(result).toEqual([]);
    });
  });

  describe("should not validate", () => {
    it("brevo transport with brevoApiKey undefined", async () => {
      const result = await validateDto(
        {
          ...mailerConfigMock,
          transport: TransportType.BREVO,
          brevoApiKey: undefined,
        },
        MailerConfig,
        DTO_VALIDATION_OPTIONS,
      );
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].property).toBe("brevoApiKey");
    });

    it("smtp transport with smtpUrl undefined", async () => {
      const result = await validateDto(
        {
          ...mailerConfigMock,
          transport: TransportType.SMTP,
          smtpUrl: undefined,
        },
        MailerConfig,
        DTO_VALIDATION_OPTIONS,
      );
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].property).toBe("smtpUrl");
    });
  });
});
