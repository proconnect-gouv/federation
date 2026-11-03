import { VALID_INPUT_STRING_REGEX } from "./valid-input-string-regex";

describe("VALID_INPUT_STRING_REGEX", () => {
  it.each([
    "Service Provider Test",
    "Ministère de l'Économie & des Finances",
    "Maintenance de 10:00 à 12:00 (heure de Paris) !",
    "FS_test-1.2/3+4*5",
    "Œuvre Łódź Ñandú",
    "multi\nligne",
    "Ministère de l’Économie",
    "Bienvenue\u00a0!",
    "Attention\u202f: maintenance",
    "Le service « Docs » est indisponible…",
    "Le “nouveau” portail – version 2 — bêta",
    "Une question ? Contactez-nous ; merci",
  ])("should accept %j", (input) => {
    expect(VALID_INPUT_STRING_REGEX.test(input)).toBe(true);
  });

  it.each([
    "",
    "<img src=x onerror=alert(1)>",
    "<script>alert(1)</script>",
    'name" onmouseover="alert(1)',
    "a=b",
    "a < b",
    "a > b",
    "`a`",
    "2 × 3",
    "6 ÷ 3",
  ])("should reject %j", (input) => {
    expect(VALID_INPUT_STRING_REGEX.test(input)).toBe(false);
  });

  it("should compile with the v flag used by HTML pattern attributes", () => {
    const vRegex = new RegExp(VALID_INPUT_STRING_REGEX.source, "v");

    expect(vRegex.test("Service (test) - a/b")).toBe(true);
    expect(vRegex.test("<script>")).toBe(false);
  });
});
