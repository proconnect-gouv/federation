import { formatUserAgent } from "./format-user-agent";

describe(formatUserAgent.name, () => {
  it.each([
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
      "Firefox sur Windows",
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "Chrome sur macOS",
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
      "Microsoft Edge sur Windows",
    ],
    [
      "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
      "Firefox sur Linux",
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      "Safari sur iOS",
    ],
  ])("should format %s as %s", (userAgent, expected) => {
    expect(formatUserAgent(userAgent)).toBe(expected);
  });

  it("should fall back to an unknown browser label for an unparsable user agent", () => {
    expect(formatUserAgent("curl/8.7.1")).toBe("Navigateur inconnu");
  });

  it("should fall back to an unknown browser label for an empty user agent", () => {
    expect(formatUserAgent("")).toBe("Navigateur inconnu");
  });
});
