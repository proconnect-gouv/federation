export class MockRequest {
  public sessionId = 'session1';
  public session(key: string): string {
    return undefined;
  }
}
