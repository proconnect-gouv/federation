import { Request, Response } from 'express';

export interface CoreServiceInterface {
  redirectToIdp: (req: Request, res: Response, idpId: string) => Promise<void>;
}
