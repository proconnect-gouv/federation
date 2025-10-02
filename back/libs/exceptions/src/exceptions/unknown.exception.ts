import { BaseException } from '@fc/base-exception';

export class UnknownException extends BaseException {
  public documentation =
    'Erreur inconnue du système, ne devrait pas se produire, prévenir SN3.';
  public scope = 0;
  public code = 0;
  public ui = 'exceptions.default_message';
}
