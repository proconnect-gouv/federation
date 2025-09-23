export class ICoreTrackingLog {
  readonly browsingSessionId?: string;
  readonly claims?: string;
  readonly event: string;
  readonly idpAcr?: string;
  readonly idpEmail?: string;
  readonly idpId?: string;
  readonly idpLabel?: string;
  readonly idpName?: string;
  readonly idpSub?: string;
  readonly interactionAcr?: string;
  readonly interactionId?: string;
  readonly ip: string | string[];
  readonly login_hint?: string;
  readonly scope?: string;
  readonly sessionId?: string;
  readonly spEmail?: string;
  readonly spEssentialAcr?: string;
  readonly spId?: string;
  readonly spName?: string;
  readonly spSub?: string;
  readonly step: string;
}
