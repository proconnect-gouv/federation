import { BaseException } from './base.exception';

export class UnknownException extends BaseException {
  public documentation =
    'Erreur inconnue du système, ne devrait pas se produire, prévenir SN3.';
  static SCOPE = 0;
  public code = 0;
  static UI = 'exceptions.default_message';
}
