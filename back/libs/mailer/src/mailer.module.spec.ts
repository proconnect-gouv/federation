import { ConfigModule } from "@fc/config";
import { Test } from "@nestjs/testing";
import nodemailer from "nodemailer";

import { BrevoAdapter } from "./adapters/brevo.adapter";
import { NoneAdapter } from "./adapters/none.adapter";
import { SmtpAdapter } from "./adapters/smtp.adapter";
import { MailerModule } from "./mailer.module";
import { MailerService } from "./mailer.service";

jest.mock("nodemailer");

describe("MailerModule", () => {
  it("should provide a BrevoAdapter for the brevo transport", async () => {
    const module = await Test.createTestingModule({
      imports: [
        MailerModule.forRoot(),
        ConfigModule.forRoot({
          get: jest.fn().mockReturnValue({
            transport: "brevo",
            brevoApiKey: "brevo-key",
          }),
        }),
      ],
    }).compile();

    expect(module.get(MailerService)).toBeInstanceOf(BrevoAdapter);
  });

  it("should provide an SmtpAdapter with a transporter built from the smtp url", async () => {
    const module = await Test.createTestingModule({
      imports: [
        MailerModule.forRoot(),
        ConfigModule.forRoot({
          get: jest.fn().mockReturnValue({
            transport: "smtp",
            smtpUrl: "smtp://mail.example.com:587",
          }),
        }),
      ],
    }).compile();

    expect(module.get(MailerService)).toBeInstanceOf(SmtpAdapter);
    expect(nodemailer.createTransport).toHaveBeenLastCalledWith(
      "smtp://mail.example.com:587",
    );
  });

  it("should provide a NoneAdapter when no transport is configured", async () => {
    const module = await Test.createTestingModule({
      imports: [
        MailerModule.forRoot(),
        ConfigModule.forRoot({
          get: jest.fn().mockReturnValue({}),
        }),
      ],
    }).compile();

    expect(module.get(MailerService)).toBeInstanceOf(NoneAdapter);
  });
});
