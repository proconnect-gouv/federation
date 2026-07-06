import { AccountFcaService } from "@fc/account-fca";
import { ConfigService } from "@fc/config";
import { IdentityProviderAdapterMongoService } from "@fc/identity-provider-adapter-mongo";
import { LoggerService } from "@fc/logger";
import { Injectable } from "@nestjs/common";
import {
  gouvfrDomains,
  mostUsedFreeEmailDomains,
  otherGouvDomains,
} from "@proconnect-gouv/proconnect.core/data";
import { run as spellCheckEmail } from "@zootools/email-spell-checker";
import { uniq } from "lodash";
import { EmailValidatorConfig } from "../dto";

@Injectable()
export class EmailValidatorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly identityProviderAdapterMongoService: IdentityProviderAdapterMongoService,
    private readonly config: ConfigService,
    private readonly accountFcaService: AccountFcaService,
  ) {}

  async validate(email: string) {
    try {
      const idps =
        await this.identityProviderAdapterMongoService.getIdpsByEmail(email);
      if (idps.length > 0) {
        return { isEmailValid: true };
      }

      const accountFcaExists =
        await this.accountFcaService.checkEmailExists(email);
      if (accountFcaExists) {
        return { isEmailValid: true };
      }

      const isEmailValid = await this.isEmailDomainValid(email);
      if (isEmailValid) {
        return { isEmailValid: true };
      }

      const idpDomains = await this.getIdpDomains();

      const suggestion = this.getEmailSuggestion(email, idpDomains);
      return { isEmailValid: false, suggestion };
    } catch (error) {
      this.logger.error(error);
      return { isEmailValid: true };
    }
  }

  private getEmailSuggestion(email: string, idpDomains: string[]): string {
    const { domainWhitelist } =
      this.config.get<EmailValidatorConfig>("EmailValidator");

    const domains = uniq([
      ...gouvfrDomains,
      ...otherGouvDomains,
      ...mostUsedFreeEmailDomains,
      ...idpDomains,
      ...domainWhitelist,
    ]);

    const suggestedEmail = spellCheckEmail({
      domains,
      domainThreshold: 3,
      topLevelDomains: ["fr", "com", "net"],
      secondLevelDomains: ["gouv"],
      email,
    });
    return suggestedEmail ? suggestedEmail.full : "";
  }

  private async getIdpDomains() {
    const idps = await this.identityProviderAdapterMongoService.getList();
    const domains = uniq(idps.flatMap((idp) => idp.fqdns ?? []));

    return domains;
  }

  private async isEmailDomainValid(email: string) {
    const emailDomain =
      this.identityProviderAdapterMongoService.getFqdnFromEmail(email);
    if (!emailDomain) return false;

    const { domainWhitelist, featureMxResolutionValidation } =
      this.config.get<EmailValidatorConfig>("EmailValidator");

    if (domainWhitelist.includes(emailDomain)) return true;

    if (!featureMxResolutionValidation) return false;

    const isDomainReachable = await this.computeIsDomainReachable(emailDomain);
    return isDomainReachable;
  }

  private async computeIsDomainReachable(domain: string): Promise<boolean> {
    try {
      const mxResponse = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
      );
      const mxData = (await mxResponse.json()) as {
        Answer?: { name: string }[];
      };
      const { Answer } = mxData;
      if (Answer) {
        return Array.isArray(Answer) && Answer.length > 0;
      }
      const dnsResponse = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}`,
      );
      const dnsData = (await dnsResponse.json()) as {
        Answer?: { name: string }[];
      };

      return Array.isArray(dnsData.Answer) && dnsData.Answer.length > 0;
    } catch {
      return false;
    }
  }
}
