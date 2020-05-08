export interface IIdentityService {
  /**
   * @TODO create an interface for output
   */
  storeIdpIdentity(key: string, identity: any, meta: any): Promise<boolean>;
}
