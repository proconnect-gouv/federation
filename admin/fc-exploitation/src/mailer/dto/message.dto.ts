import {
  ValidateNested,
  IsDefined,
  IsNumber,
  IsOptional,
  IsArray,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

import { SendParamsRecipient } from './send-params-recipient.dto';
import { InlinedAttachments } from './inlined-attachments.dto';
import { Attachements } from './attachments.dto';

export class Message {
  @IsDefined()
  @ValidateNested()
  From: SendParamsRecipient;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SendParamsRecipient)
  To: SendParamsRecipient[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SendParamsRecipient)
  Cc?: SendParamsRecipient[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SendParamsRecipient)
  Bcc?: SendParamsRecipient[];

  @IsOptional()
  Variables?: object;

  @IsOptional()
  @IsNumber()
  TemplateID?: number;

  @IsOptional()
  @IsBoolean()
  TemplateLanguage?: boolean;

  @IsString()
  Subject: string;

  @IsOptional()
  @IsString()
  TextPart?: string;

  @IsOptional()
  @IsString()
  HTMLPart?: string;

  @IsOptional()
  @IsString()
  MonitoringCategory?: string;

  @IsOptional()
  @IsString()
  URLTags?: string;

  @IsOptional()
  @IsString()
  CustomCampaign?: string;

  @IsOptional()
  @IsBoolean()
  DeduplicateCampaign?: boolean;

  @IsOptional()
  @IsString()
  EventPayload?: string;

  @IsOptional()
  @IsString()
  CustomID?: string;

  @IsOptional()
  Headers?: object;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Attachements)
  Attachments?: Attachements[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InlinedAttachments)
  InlinedAttachments?: InlinedAttachments[];
}
