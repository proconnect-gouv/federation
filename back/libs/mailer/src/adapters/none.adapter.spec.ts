import { NoneAdapter } from "./none.adapter";

describe("NoneAdapter", () => {
  it("should resolve with an empty messageId", async () => {
    const adapter = new NoneAdapter();

    const result = await adapter.sendMail({
      to: "test@example.com",
      subject: "Hello",
      htmlContent: "<p>Hi</p>",
    });

    expect(result).toEqual({ messageId: "" });
  });
});
