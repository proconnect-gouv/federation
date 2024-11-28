import { I18nTranslationsMapType } from '@fc/i18n';
import { enGB as enGBClaims } from '@fc/scopes';

export const enGB: I18nTranslationsMapType = {
  // claims
  ...enGBClaims,

  // Meta
  'meta.lang': 'en',

  // Common
  'common.close': 'Close',
  'common.new_window': 'Open a new window',

  // Footer
  'footer.a11y_conformity': 'Accessibility: non-compliant',
  'footer.more_info': 'Learn more about {platform}',
  'footer.tos': 'TOS',
  'footer.faq': 'Frequently Asked Questions',

  // Navigation
  'nav.back_to_provider': 'Back to {spName}',
  'nav.more_info': 'More info',

  // Interaction
  'interaction.page_title': 'Connection - Choose an account - {platform}',
  'interaction.anonymous_no_personal_data':
    'You will login anonymously, no personal data will be transmitted',
  'interaction.idp_connexion_failed':
    'Connection to <b>{idpName}</b> failed. Please try again or use another connection method.',
  'interaction.beta_provider': 'BETA',
  'interaction.connecting_to': 'Connecting to {spName}',
  'interaction.choose_provider': 'Choose an account to connect with:',
  'interaction.modal.cancel_text': 'Choose another account',

  // Consent
  'consent.page_title':
    'Connection - Continue to {spName} Service - {platform}',
  'consent.login_as': 'You will login as:',
  'consent.login_anonymously': 'You will login anonymously',
  'consent.continue_to_sp': 'Continue to {spName}',
  'consent.data_transfer_consent':
    'I agree for FranceConnect to transmit my data to the service in order to log me in',
  'consent.consent_checkbox': 'Check the box to accept the data transfer',
  'consent.transmitted_data': 'Transmitted data',
  'consent.data_fetched_from': 'Data fetched from {dpName}',
  'consent.no_personal_data_transmitted':
    'No personal data will be transmitted',
  'consent.information_block_title':
    'The connection notifications are evolving.',
  'consent.information_block_content':
    'FranceConnect will no longer systematically send you a notification for each connection. A notification will be sent only when an unusual connection is detected.',
  // Errors
  'error.page_title': 'Connection - Error - {platform}',
  'error.support.title': 'What to do?',
  'error.support.button_label': 'Contact us',
  'error.error_title': 'An error occurred',
  'error.error_code': 'Error {code}',
  'error.faq.title': 'Need help ?',
  'error.faq.button_label': 'Please refer to the help page',
  'error.faq.body':
    'For more information on how to use FranceConnect, please visit our help page.',
};
