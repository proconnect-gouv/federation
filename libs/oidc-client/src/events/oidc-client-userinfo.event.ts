export class OidcClientUserinfoEvent {
  constructor(
    public readonly interactionId: string,
    public readonly ip: string,
  ) {}
}
