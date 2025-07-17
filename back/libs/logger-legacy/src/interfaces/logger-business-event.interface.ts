import { NetworkContextInterface } from '@fc/tracking-context';

/**
 * This permissive interface allows us to acknowledge the intention
 * of "business logging" something.
 *
 * Since we have to explicitly implement the interface to do so.
 */
export abstract class ILoggerBusinessEvent {
  readonly category: string;
  readonly event: string;
  readonly ip: string;
  readonly source: NetworkContextInterface;
}
