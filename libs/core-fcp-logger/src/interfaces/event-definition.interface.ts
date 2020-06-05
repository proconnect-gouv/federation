export interface IEventDefinition {
  readonly step: string;
  readonly category: string;
  readonly event: string;
  readonly route: string;
  readonly intercept: boolean;
}
