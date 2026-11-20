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
  // 45 minutes in ms, so that the request ends before the OIDC interaction of
  // the requester (1 hour, started a few minutes before the request)
  maxDelayBetweenRequestCreationAndVerificationStartInMs: 45 * 60 * 1000,
};

export default crossDeviceAuthenticationConfig;
