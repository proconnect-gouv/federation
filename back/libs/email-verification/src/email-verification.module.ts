import { MailerModule } from "@fc/mailer";
import { RateLimiterModule } from "@fc/rate-limiter";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EmailVerificationService } from "./email-verification.service";
import { EmailVerificationTokenSchema } from "./schemas";
@Module({
  imports: [
    MailerModule.forRoot(),
    MongooseModule.forFeature([
      { name: "EmailVerificationToken", schema: EmailVerificationTokenSchema },
    ]),
    RateLimiterModule,
  ],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
