import { formatLocation } from "./format-location";

describe(formatLocation.name, () => {
  const now = new Date("2026-01-01T10:00:00.000Z");

  beforeEach(() => {
    jest.useFakeTimers({ now });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    [{ city: "Paris", country: "France" }, "Paris, France"],
    [{ country: "France" }, "France"],
    [{ city: "Paris" }, "Paris"],
  ])("should format the location %o", (location, expected) => {
    expect(formatLocation(location, now)).toBe(expected);
  });

  it("should tell that the location is unknown", () => {
    expect(formatLocation(null, now)).toBe("Inconnue");
  });

  it("should tell that the location of a recent request is being looked up", () => {
    const createdAt = new Date("2026-01-01T09:59:50.001Z");

    expect(formatLocation(undefined, createdAt)).toBe("recherche en cours…");
  });

  it("should tell that the location is unknown when its lookup never ended", () => {
    const createdAt = new Date("2026-01-01T09:59:50.000Z");

    expect(formatLocation(undefined, createdAt)).toBe("Inconnue");
  });
});
