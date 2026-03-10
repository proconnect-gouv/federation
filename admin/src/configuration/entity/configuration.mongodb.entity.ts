import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';
import { type ILogger } from '../interface/logger.interface';
import { type IDebug } from '../interface/debug.interface';
import { type IBuyan } from '../interface/buyan.interface';
import { type IFeatures } from '../interface/features.interface';
import { type IHttpGlobalAgent } from '../interface/http-global-agent.interface';
import { type IMobileConnect } from '../interface/mobile-connect.interface';
import { type IRnipp } from '../interface/rnipp.interface';
import { type IApplicationApiAuthorization } from '../interface/application-api-authorization.interface';
import { type IMessageOnLogin } from '../interface/message-on-login.interface';
import { type IFiMappingUserInfosRules } from '../interface/fi-mapping-user-info-rules.interface';
import { type ICompanyAPI } from '../interface/company-API.interface';
import { type IMeta } from '../interface/meta.interface';
import { type IFRIDPIdentity } from '../interface/fridp_indentity.interface';
import { type IMailjet } from '../interface/mailjet.entity';

@Entity('configuration')
export class Configuration {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  env: string;

  @Column()
  mode: string;

  @Column()
  cookieSigningSecret: string;

  @Column()
  cookieDomain: string;

  @Column()
  serverTimeout: number;

  @Column()
  accessTokenTTL: number;

  @Column()
  tracesId: string;

  @Column()
  tracesSecret: string;

  @Column()
  partnerUrl: string;

  @Column()
  issuerURL: string;

  @Column()
  callbackURL: string;

  @Column()
  logger: ILogger;

  @Column()
  debug: IDebug;

  @Column()
  bunyan: IBuyan;

  @Column()
  scope: string[];

  @Column()
  features: IFeatures;

  @Column()
  httpsGlobalAgent: IHttpGlobalAgent;

  @Column()
  mobileConnect: IMobileConnect;

  @Column()
  rnipp: IRnipp;

  @Column()
  applicationsApiAuthorization: IApplicationApiAuthorization[];

  @Column()
  messageOnLogin: IMessageOnLogin;

  @Column()
  fiMappingUserInfosRules: IFiMappingUserInfosRules;

  @Column()
  companyAPI: ICompanyAPI;

  @Column()
  // tslint:disable-next-line: variable-name
  _meta: IMeta;

  @Column()
  FRIDPIdentity: IFRIDPIdentity;

  @Column()
  mailjet: IMailjet;
}
