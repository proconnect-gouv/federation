export interface ICoreTrackingProviders {
  readonly browsingSessionId: string | null;
  readonly accountId: string | null;
  readonly sessionId: string | null;
  readonly interactionId: string | null;
  readonly interactionAcr: string | null;
  readonly reusesActiveSession: boolean;

  readonly spId: string | null;
  readonly spEssentialAcr: string | null;
  readonly spName: string | null;
  readonly spSub: string | null;

  readonly idpId: string | null;
  readonly idpAcr: string | null;
  readonly idpName: string | null;
  readonly idpSub: string | null;
  readonly idpLabel: string | null;

  readonly deviceTrusted: boolean | undefined;
  readonly deviceIsSuspicious: boolean | undefined;
}
