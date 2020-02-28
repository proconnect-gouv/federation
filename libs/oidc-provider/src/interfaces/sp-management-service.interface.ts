export interface ISpManagementService {
  isUsable(id: string): Promise<boolean>;
}
