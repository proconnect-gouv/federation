import { IEventDefinition } from './event-definition.interface';

export interface IEventMap {
  [key: string]: IEventDefinition;
}
