export interface IIdentityService {
  /**
   * @TODO create an interface for output
   */
  getSpIdentity(id: string): Promise<any | boolean>;
}
