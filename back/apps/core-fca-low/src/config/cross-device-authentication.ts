import { CrossDeviceAuthenticationConfig } from "#libs/cross-device-authentication";

const crossDeviceAuthenticationConfig: CrossDeviceAuthenticationConfig = {
  emojiAlphabet: [
    "🐸",
    "🐧",
    "🦋",
    "🐙",
    "🐝",
    "🐘",
    "🌵",
    "🌻",
    "🍄",
    "🌙",
    "🌈",
    "🔥",
    "🌊",
    "🍍",
    "🍉",
    "🍇",
    "🥕",
    "🍕",
    "🍩",
    "🍔",
    "⚽",
    "🎸",
    "🎩",
    "🎁",
    "🔑",
    "💡",
    "📚",
    "👑",
    "⚓",
    "🚗",
    "🚲",
    "🚀",
  ],
  emojiCodeLength: 5,
  requestExpirationDurationInMs: 10 * 60 * 1000, // 10 minutes in ms
};

export default crossDeviceAuthenticationConfig;
