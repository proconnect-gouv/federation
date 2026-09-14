import type { Transporter } from "nodemailer";

import type { MailerConfig } from "../dto";
import { SmtpAdapter } from "./smtp.adapter";

describe("SmtpAdapter", () => {
  const config = {
    fromEmail: "noreply@example.com",
    fromName: "ProConnect",
  } as MailerConfig;
  const setup = () => {
    const sendMailMock = jest.fn().mockResolvedValue({ messageId: "smtp-123" });
    const adapter = new SmtpAdapter(config, {
      sendMail: sendMailMock,
      verify: jest.fn().mockResolvedValue(true),
    } as unknown as Transporter);
    return { sendMailMock, adapter };
  };
  describe("ping", () => {
    it("should return true when the SMTP server is reachable", async () => {
      const { adapter } = setup();
      const result = await adapter.ping();

      expect(result).toBe(true);
    });
  });
  describe("sendMail", () => {
    it("should send mail through the injected transporter", async () => {
      const { sendMailMock, adapter } = setup();

      const result = await adapter.sendMail({
        to: "test@example.com",
        subject: "Hello",
        htmlContent: "<p>Hi</p>",
      });

      expect(sendMailMock).toHaveBeenCalledWith({
        from: { name: "ProConnect", address: "noreply@example.com" },
        to: "test@example.com",
        subject: "Hello",
        html: "<p>Hi</p>",
      });
      expect(result).toEqual({ messageId: "smtp-123" });
    });
  });
});
