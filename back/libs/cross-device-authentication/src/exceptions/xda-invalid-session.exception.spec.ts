import { XdaInvalidSession } from "./xda-invalid-session.exception";

describe("XdaInvalidSession", () => {
  describe("constructor", () => {
    it("should display the instructions to reach the review page", () => {
      const result = new XdaInvalidSession();

      expect(result["description"]).toContain(
        '<a href="https://proconnect.gouv.fr/xda"',
      );
    });
  });
});
