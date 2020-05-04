export class FcException extends Error {
  /**
   * Inform about wich module triggered the error
   * Each module should avec a unique id
   *
   * Legacy codes:
   * - 00: Core
   * - 01: RNIPP
   * - 02: Identity Providers (IdP)
   * - 03: Service providers (SP)
   * - 04: Data providers (DP)
   * - 05: eIDAS
   *
   * @since core-v2 :
   * - 15: Identity
   * - 16 : Cryptography
   * - 17 : Consumer-HSM
   * - 18 : Account
   */
  public scope: number;

  /**
   * Unique id for the error being reported
   * @see https://confluence.kaliop.net/display/FC/Codes+erreurs+des+applications
   * @TODO derivat the above documentaiton from the code it self?
   */
  public code: number;

  public originalError?: Error;

  constructor(input?: Error | string) {
    let arg: unknown = input;

    if (input instanceof Error) {
      arg = input.message;
    }

    super(arg as string);

    if (input instanceof Error) {
      this.originalError = input;
    }
  }
}
