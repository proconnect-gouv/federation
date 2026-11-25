import { IpLocation } from "#libs/ip-geolocation";

// The lookup itself is much shorter: beyond this, it will never end (e.g. the
// server restarted in the meantime)
const MAX_LOOKUP_DURATION_IN_MS = 10 * 1000;

/**
 * @param location undefined while it is being looked up, null if it is unknown
 */
export const formatLocation = (
  location: IpLocation | null | undefined,
  createdAt: Date,
): string => {
  if (location) {
    return [location.city, location.country].filter(Boolean).join(", ");
  }

  const isBeingLookedUp =
    location === undefined &&
    Date.now() - createdAt.getTime() < MAX_LOOKUP_DURATION_IN_MS;

  return isBeingLookedUp ? "recherche en cours…" : "Inconnue";
};
