// @NOTE la présence du fraudSurveyOrigin en tant que query param est temporaire
// la duplication des routes '/fraud/form' est donc vouée à disparaître
export enum UserDashboardFrontRoutes {
  HISTORY = '/history',
  PREFERENCES = '/preferences',
  FRAUD_FORM = '/fraud/form',
  FRAUD_FORM_IDENTITE_CONNUE = '/fraud/form?fraudSurveyOrigin=identite-connue',
  FRAUD_FORM_IDENTITE_INCONNUE = '/fraud/form?fraudSurveyOrigin=identite-inconnue',
  INDEX = '/',
}
