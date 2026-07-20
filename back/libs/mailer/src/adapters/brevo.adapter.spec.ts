import type { MailerConfig } from "../dto";
import { BrevoAdapter } from "./brevo.adapter";

describe("BrevoAdapter", () => {
  const config = {
    fromEmail: "noreply@example.com",
    fromName: "ProConnect",
    brevoApiKey: "brevo-key",
  } as MailerConfig;

  const dto = {
    to: "test@example.com",
    subject: "Hello",
    htmlContent: "<p>Hi</p>",
  };

  const setup = () => {
    const fetchFn = jest.fn();
    const adapter = new BrevoAdapter(
      config,
      fetchFn as unknown as typeof globalThis.fetch,
    );
    return { fetchFn, adapter };
  };

  it("should call the Brevo API and return the messageId", async () => {
    const { fetchFn, adapter } = setup();
    fetchFn.mockResolvedValue({
      ok: true,
      json: async () => ({ messageId: "brevo-123" }),
    });

    const result = await adapter.sendMail(dto);

    expect(fetchFn).toHaveBeenCalledWith(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": "brevo-key",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "ProConnect", email: "noreply@example.com" },
          to: [{ email: "test@example.com" }],
          subject: "Hello",
          htmlContent: "<p>Hi</p>",
        }),
      },
    );
    expect(result).toEqual({ messageId: "brevo-123" });
  });

  it("should throw when the Brevo API responds with an error", async () => {
    const { fetchFn, adapter } = setup();
    fetchFn.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "unauthorized",
    });

    await expect(adapter.sendMail(dto)).rejects.toThrow(
      "Brevo API error: 401 unauthorized",
    );
  });
});
