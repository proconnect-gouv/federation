import Bowser from "bowser";

const UNKNOWN_BROWSER = "Navigateur inconnu";

export function formatUserAgent(userAgent: string): string {
  if (!userAgent) {
    return UNKNOWN_BROWSER;
  }

  const { browser, os } = Bowser.parse(userAgent);
  const browserName = browser.name || UNKNOWN_BROWSER;

  return os.name ? `${browserName} sur ${os.name}` : browserName;
}
