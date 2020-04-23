export interface IIdentityService {
  /**
   * @TODO create an interface for output
   */
  getIdentity(id: string): Promise<object | boolean>;
}
