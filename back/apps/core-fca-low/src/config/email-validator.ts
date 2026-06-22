import { ConfigParser } from "@fc/config";
import type { EmailValidatorConfig } from "@fc/email-validator/dto";

const env = new ConfigParser(process.env, "EmailValidator");

const emailValidatorConfig: EmailValidatorConfig = {
  domainWhitelist: env.stringArray("DOMAIN_WHITELIST"),
  featureMxResolutionValidation: env.boolean(
    "FEATURE_MX_RESOLUTION_VALIDATION",
  ),
};

export default emailValidatorConfig;
