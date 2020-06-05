import { IEventProperties } from '../interfaces';

export class RnippBaseEvent {
  constructor(public readonly properties: IEventProperties) {}
}
