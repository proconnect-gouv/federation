import { CrossDeviceAuthenticationConfig } from "#libs/cross-device-authentication";

const crossDeviceAuthenticationConfig: CrossDeviceAuthenticationConfig = {
  emojiAlphabet: [
    { symbol: "🐸", label: "Grenouille" },
    { symbol: "🐧", label: "Pingouin" },
    { symbol: "🦋", label: "Papillon" },
    { symbol: "🐙", label: "Pieuvre" },
    { symbol: "🐝", label: "Abeille" },
    { symbol: "🐘", label: "Éléphant" },
    { symbol: "🌵", label: "Cactus" },
    { symbol: "🌻", label: "Tournesol" },
    { symbol: "🍄", label: "Champignon" },
    { symbol: "🌙", label: "Lune" },
    { symbol: "🌈", label: "Arc-en-ciel" },
    { symbol: "🔥", label: "Feu" },
    { symbol: "🌊", label: "Vague" },
    { symbol: "🍍", label: "Ananas" },
    { symbol: "🍉", label: "Pastèque" },
    { symbol: "🍇", label: "Raisin" },
    { symbol: "🥕", label: "Carotte" },
    { symbol: "🍕", label: "Pizza" },
    { symbol: "🍩", label: "Donut" },
    { symbol: "🍔", label: "Hamburger" },
    { symbol: "⚽", label: "Ballon" },
    { symbol: "🎸", label: "Guitare" },
    { symbol: "🎩", label: "Chapeau" },
    { symbol: "🎁", label: "Cadeau" },
    { symbol: "🔑", label: "Clé" },
    { symbol: "💡", label: "Ampoule" },
    { symbol: "📚", label: "Livres" },
    { symbol: "👑", label: "Couronne" },
    { symbol: "⚓", label: "Ancre" },
    { symbol: "🚗", label: "Voiture" },
    { symbol: "🚲", label: "Vélo" },
    { symbol: "🚀", label: "Fusée" },
  ],
  emojiCodeLength: 5,
  requestExpirationDurationInMs: 10 * 60 * 1000, // 10 minutes in ms
  // 45 minutes in ms, so that the request ends before the OIDC interaction of
  // the requester (1 hour, started a few minutes before the request)
  maxDelayBetweenRequestCreationAndVerificationStartInMs: 45 * 60 * 1000,
};

export default crossDeviceAuthenticationConfig;
