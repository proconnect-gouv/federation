import { Request } from 'express';

export type TrackedEventContextInterface = {
  req?: Request;
  sessionId?: string;
};
