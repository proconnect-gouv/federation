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
  requestExpirationDurationInMs: 5 * 60 * 1000, // 5 minutes in ms
};

export default crossDeviceAuthenticationConfig;
