export interface IIdentityManagementService {
  /**
   * @TODO create an interface for output
   */
  getIdentity(id: string): Promise<object>;
}
