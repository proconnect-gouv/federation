/**
 * Allows latin letters (with Latin-1 and Latin Extended-A accents), digits,
 * whitespace and the following punctuation:
 * , . : ; ! ? _ ' ’ « » “ ” – — … & * + ( ) / -
 *
 * \s already covers the French non-breaking spaces (U+00A0, U+202F, U+2009).
 *
 * À-Ö, Ø-ö and ø-ž are split to exclude × (U+00D7) and ÷ (U+00F7).
 * @see https://stackoverflow.com/a/26900132/1071169
 *
 * The source is also used in HTML `pattern` attributes, which browsers compile
 * with the `v` flag: keep ( ) / - escaped inside the character class, and
 * never put the same punctuation twice in a row (e.g. ;; or ??).
 */
export const VALID_INPUT_STRING_REGEX =
  /^[A-Za-z0-9À-ÖØ-öø-ž\s,.:;!?_'’«»“”–—…&*+\(\)\/\-]+$/;
