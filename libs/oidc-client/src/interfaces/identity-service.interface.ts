export interface IIdentityService {
  /**
   * @TODO create an interface for output
   */
  storeIdentity(key: string, identity: any, meta: any): Promise<boolean>;
}
