import { I18nServiceNotInitializedExceptions, I18nTranslationNotFound } from '../exceptions';
import type {
  TranslationMapType,
  TranslationsReplacementType,
  TranslationValueType,
} from '../types';

let INSTANCE: I18nService | null = null;

export class I18nService {
  // @todo: solve the trouble to its origin to avoid losing security of unique instanciation for a storybook compilator trouble.
  // https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/940#note_185748
  locale;

  translations;

  constructor(locale: string, translations: TranslationMapType) {
    this.locale = locale;
    this.translations = translations;
  }

  static initialize(locale: string, map: TranslationMapType): void {
    INSTANCE = new I18nService(locale, map);
  }

  static instance(): I18nService {
    if (INSTANCE === null) {
      throw new I18nServiceNotInitializedExceptions();
    }

    return INSTANCE;
  }

  translate(key: string, values: TranslationsReplacementType = {}): string {
    let translated = this.translations[key];

    if (translated === undefined) {
      throw new I18nTranslationNotFound(key);
    }

    translated = this.handlePlural(translated, values);

    translated = this.handleSubstitution(translated, values);

    return translated;
  }

  // Makes it easier for testing purpose to have instance members
  // eslint-disable-next-line class-methods-use-this
  private handlePlural(input: TranslationValueType, values: TranslationsReplacementType): string {
    if (typeof input === 'string') {
      return input;
    }

    const def = input.definition;
    const value = values[input.term];

    const count = typeof value === 'string' ? parseInt(value, 10) : value;

    if (count === 0) {
      return def.zero || def.other;
    }

    if (count === 1) {
      return def.one || def.few || def.other;
    }

    if (count === 2) {
      return def.two || def.few || def.other;
    }

    if (count >= 3 && count <= 6) {
      return def.few || def.other;
    }

    if (count > 6) {
      return def.many || def.other;
    }

    return def.other;
  }

  // Makes it easier for testing purpose to have instance members
  // eslint-disable-next-line class-methods-use-this
  private handleSubstitution(input: string, values: TranslationsReplacementType): string {
    return Object.keys(values).reduce(
      (output, key) => output.replaceAll(`{${key}}`, `${values[key]}`),
      input,
    );
  }
}
