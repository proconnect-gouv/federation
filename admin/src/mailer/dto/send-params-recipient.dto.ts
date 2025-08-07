import { IsEmail, IsString, IsDefined } from 'class-validator';

/**
 * `SendParamsRecipient` member of SendParamsMessage ( all params to build an email )
 * ```ts
 * From: {
 *   Email: "email@email.com"
 *   Name: "name"
 * };
 * To: [{
 *   Email: "email@email.com"
 *   Name: "name"
 * }];
 * Cc?: [{
 *   Email: "email@email.com"
 *   Name: "name"
 * }];
 * Bcc?: [{
 *   Email: "email@email.com"
 *   Name: "name"
 * }];
 * ```
 */

export class SendParamsRecipient {
  @IsDefined()
  @IsEmail()
  Email: string;

  @IsDefined()
  @IsString()
  Name: string;
}
