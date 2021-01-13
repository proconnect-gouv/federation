import { IsObject } from 'class-validator';
import { IFeatureHandlerDatabaseMap } from '../interfaces';
export class FeatureHandlerConfig {
  @IsObject()
  readonly handlers: IFeatureHandlerDatabaseMap;
}
