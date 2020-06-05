export class OidcClientTokenEvent {
  constructor(
    public readonly interactionId: string,
    public readonly ip: string,
  ) {}
}
