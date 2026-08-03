import { ConfigParser } from "@fc/config";
import { EmailVerificationConfig } from "@fc/email-verification";

const env = new ConfigParser(process.env, "EmailVerification");

const emailVerificationConfig: EmailVerificationConfig = {
  eligibleEmailsPercentage: env.number("ELIGIBLE_EMAILS_PERCENTAGE"),
  tokenExpirationDurationInMs: 60 * 60 * 1000, // 1 hour
  verificationEmailCooldownBeforeResendInMs: 10 * 60 * 1000, // 10 minutes
};

export default emailVerificationConfig;
