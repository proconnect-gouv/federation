/**
 * Regexp to allow most legit alphanum characters
 * @see https://stackoverflow.com/a/26900132/1071169
 * @see https://unicode-table.com/en/
 * \u0026 => &
 * \u002f => /
 */
const VALID_EMAIL_REGEX_STRING =
  "([a-zA-Z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,10})";

const VALID_EMAILS_REGEX_STRING = `${VALID_EMAIL_REGEX_STRING}(\n${VALID_EMAIL_REGEX_STRING})*`;
export const VALID_EMAILS_REGEX = new RegExp(`^${VALID_EMAILS_REGEX_STRING}$`);

export const VALID_EMAIL_REGEX = new RegExp(`^${VALID_EMAIL_REGEX_STRING}$`);
