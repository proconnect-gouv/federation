import { NoIdpException } from "./no-idp.exception";

describe("NoIdpException", () => {
  describe("constructor", () => {
    it("should use default properties", () => {
      const result = new NoIdpException(undefined, "");

      expect(result["spName"]).toEqual("le service");
    });
  });
});
