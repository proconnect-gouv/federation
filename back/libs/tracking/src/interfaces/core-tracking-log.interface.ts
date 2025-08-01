import { TrackingLogInterface } from './tracking-log.interface';

export class ICoreTrackingLog extends TrackingLogInterface {
  readonly sessionId: string;
  readonly interactionId: string;
  readonly step: string;
  /** Service provider informations */
  readonly spId: string;
  readonly spEssentialAcr?: string;
  readonly spName: string;

  /** Identity provider informations */
  readonly idpId?: string;
  readonly idpAcr?: string;
  readonly idpName?: string;
  readonly idpLabel?: string;

  /** Data Provider informations */
  readonly dpId?: string;
  readonly dpTitle?: string;
  readonly dpClientId?: string;

  readonly claims?: string;
  readonly scope?: string;
}
