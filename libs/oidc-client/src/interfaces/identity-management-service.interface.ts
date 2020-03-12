export interface IIdentityManagementService {
  /**
   * @TODO create an interface for output
   */
  storeIdentity(key: string, identity: any): Promise<boolean>;
}
