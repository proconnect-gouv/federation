import crossDeviceAuthenticationConfig from "./cross-device-authentication";

describe("CrossDeviceAuthentication config", () => {
  const { emojiAlphabet, emojiCodeLength } = crossDeviceAuthenticationConfig;

  it("should only contain distinct single code point emojis", () => {
    const symbols = emojiAlphabet.map(({ symbol }) => symbol);

    expect(new Set(symbols).size).toBe(symbols.length);
    symbols.forEach((symbol) => {
      expect([...symbol]).toHaveLength(1);
      expect(symbol).toMatch(/^\p{Emoji_Presentation}$/u);
    });
  });

  it("should give a distinct label to each emoji", () => {
    const labels = emojiAlphabet.map(({ label }) => label);

    expect(new Set(labels).size).toBe(labels.length);
  });

  it("should have enough emojis to draw a code without repetition", () => {
    expect(emojiAlphabet.length).toBeGreaterThanOrEqual(emojiCodeLength);
  });
});
