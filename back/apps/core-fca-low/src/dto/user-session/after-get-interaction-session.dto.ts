import { IsDefined } from 'class-validator';

import { UserSession } from './user-session.dto';

export class AfterGetInteractionSessionDto extends UserSession {
  @IsDefined()
  declare browsingSessionId: string;

  @IsDefined()
  declare spId: string;

  @IsDefined()
  declare spName: string;

  @IsDefined()
  declare interactionId: string;

  @IsDefined()
  declare spState: string;

  @IsDefined()
  declare reusesActiveSession: boolean;
}
