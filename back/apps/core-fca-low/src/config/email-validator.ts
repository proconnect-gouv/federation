import { ConfigParser } from "#libs/config";
import type { EmailValidatorConfig } from "#libs/email-validator/dto/index";

const env = new ConfigParser(process.env, "EmailValidator");

const emailValidatorConfig: EmailValidatorConfig = {
  domainWhitelist: env.stringArray("DOMAIN_WHITELIST"),
  featureMxResolutionValidation: env.boolean(
    "FEATURE_MX_RESOLUTION_VALIDATION",
  ),
};

export default emailValidatorConfig;
