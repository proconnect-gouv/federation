export const LoginFormComponent = jest.fn(() => <div data-mockid="LoginFormComponent" />);

export const getFraudSupportFormUrl = jest.fn();

export const FraudOptions = {
  CONFIG_NAME: 'Fraud',
  SURVEY_ORIGIN_UNKOWN: 'unknown',
};

export const Routes = {
  FRAUD_LOGIN: '/fraud',
  HISTORY: '/history',
  PREFERENCES: '/preferences',
  FRAUD_FORM: '/fraud/form',
};
