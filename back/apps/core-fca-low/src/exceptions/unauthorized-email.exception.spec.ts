import { UnauthorizedEmailException } from "./unauthorized-email.exception";

describe("UnauthorizedEmailException", () => {
  describe("constructor", () => {
    it("should use default properties", () => {
      const result = new UnauthorizedEmailException("", "");

      expect(result["description"]).toContain("✅ \n❌ gmail, yahoo, orange");
    });
  });
});
