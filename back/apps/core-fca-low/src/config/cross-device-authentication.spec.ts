import crossDeviceAuthenticationConfig from "./cross-device-authentication";

describe("CrossDeviceAuthentication config", () => {
  const { emojiAlphabet, emojiCodeLength } = crossDeviceAuthenticationConfig;

  it("should only contain distinct single code point emojis", () => {
    expect(new Set(emojiAlphabet).size).toBe(emojiAlphabet.length);
    emojiAlphabet.forEach((emoji) => {
      expect([...emoji]).toHaveLength(1);
      expect(emoji).toMatch(/^\p{Emoji_Presentation}$/u);
    });
  });

  it("should have enough emojis to draw a code without repetition", () => {
    expect(emojiAlphabet.length).toBeGreaterThanOrEqual(emojiCodeLength);
  });
});
