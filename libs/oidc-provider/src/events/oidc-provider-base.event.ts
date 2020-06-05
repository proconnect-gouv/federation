import { IEventProperties } from '../interfaces';

export class OidcProviderBaseEvent {
  constructor(public readonly properties: IEventProperties) {}
}
