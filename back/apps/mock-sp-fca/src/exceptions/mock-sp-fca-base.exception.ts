import { Description, FcException } from '@fc/error';

// declarative code
// istanbul ignore next line
@Description(`Erreur émise lorsqu'il y a une erreur sur le mock AgentConnect`)
export class MockSpFcaBaseException extends FcException {
  scope = 10;
}
