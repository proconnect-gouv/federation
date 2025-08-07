import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { ILogger } from '../interface/logger.interface';
import { IDebug } from '../interface/debug.interface';
import { IBuyan } from '../interface/buyan.interface';
import { IFeatures } from '../interface/features.interface';
import { IHttpGlobalAgent } from '../interface/http-global-agent.interface';
import { IMobileConnect } from '../interface/mobile-connect.interface';
import { IRnipp } from '../interface/rnipp.interface';
import { IApplicationApiAuthorization } from '../interface/application-api-authorization.interface';
import { IMessageOnLogin } from '../interface/message-on-login.interface';
import { IFiMappingUserInfosRules } from '../interface/fi-mapping-user-info-rules.interface';
import { ICompanyAPI } from '../interface/company-API.interface';
import { IMeta } from '../interface/meta.interface';
import { IFRIDPIdentity } from '../interface/fridp_indentity.interface';
import { IMailjet } from '../interface/mailjet.entity';

@Entity('configuration')
export class Configuration {
  @ObjectIdColumn()
  // tslint:disable-next-line: variable-name
  _id: ObjectID;

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
