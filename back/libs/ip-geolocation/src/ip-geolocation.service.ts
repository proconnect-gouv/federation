import { ConfigService } from "#libs/config";
import { LoggerService } from "#libs/logger";
import { HttpStatus, Injectable } from "@nestjs/common";
import ipaddr from "ipaddr.js";
import { IpGeolocationConfig, IpLocation } from "./dto";

const MOCKED_LOCATION: IpLocation = { city: "Paris", country: "France" };

type LocalizedNames = { names?: { fr?: string; en?: string } };
type CityResponse = { city?: LocalizedNames; country?: LocalizedNames };

/**
 * Approximate location of an IP address, according to MaxMind.
 * @see https://dev.maxmind.com/geoip/docs/web-services/
 */
@Injectable()
export class IpGeolocationService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * @returns null if the location is unknown. Never throws.
   */
  async getLocation(ip: string | undefined): Promise<IpLocation | null> {
    const { shouldMockApi } =
      this.config.get<IpGeolocationConfig>("IpGeolocation");
    if (shouldMockApi) {
      return MOCKED_LOCATION;
    }

    if (!this.isPublic(ip)) {
      return null;
    }

    try {
      return await this.fetchLocation(ip);
    } catch (error) {
      this.logger.error({
        code: "ip-geolocation-error",
        ipGeolocationError: error?.message,
        ipGeolocationErrorCause: error?.cause?.code,
      });
      return null;
    }
  }

  private isPublic(ip: string | undefined): boolean {
    return (
      !!ip && ipaddr.isValid(ip) && ipaddr.process(ip).range() === "unicast"
    );
  }

  private async fetchLocation(ip: string): Promise<IpLocation | null> {
    const { baseUrl, accountId, licenseKey, timeoutInMs } =
      this.config.get<IpGeolocationConfig>("IpGeolocation");
    const address = ipaddr.process(ip).toString();
    const credentials = Buffer.from(`${accountId}:${licenseKey}`).toString(
      "base64",
    );

    const response = await fetch(`${baseUrl}/geoip/v2.1/city/${address}`, {
      headers: { Authorization: `Basic ${credentials}` },
      signal: AbortSignal.timeout(timeoutInMs),
    });

    // the address is not in the database
    if (response.status === HttpStatus.NOT_FOUND) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Unexpected HTTP status ${response.status}`);
    }

    const body = (await response.json()) as CityResponse;
    const city = this.getName(body.city);
    const country = this.getName(body.country);

    return city || country ? { city, country } : null;
  }

  private getName(place?: LocalizedNames): string | undefined {
    return place?.names?.fr ?? place?.names?.en;
  }
}
