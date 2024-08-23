/* istanbul ignore file */

// declarative file
import type { FraudConfig } from '@fc/user-dashboard';

export const Fraud: FraudConfig = {
  fraudSupportFormPathname: '/usurpation',
  supportFormUrl: process.env.SUPPORT_FORM_URL,
  surveyOriginQueryParam: 'fraudSurveyOrigin',
};
