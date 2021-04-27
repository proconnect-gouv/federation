/* istanbul ignore file */

// declarative code
import { Request } from 'express';
import { SessionGenericService } from '../session-generic.service';

export interface ISessionGenericRequest extends Request {
  sessionId: string;
  sessionService: SessionGenericService;
}
