import {
  $IsIpAddressesAndRange,
  $IsLength,
  $IsNumeric,
  $IsRedirectURL,
  $IsSignedResponseAlg,
  $IsString,
  $IsWebsiteURL,
  $Matches,
  Form,
  FormDtoBase,
  Input,
} from '@fc/dto2form';

@Form()
export class ServiceProviderInstanceVersionDto extends FormDtoBase {
  @Input({
    required: true,
    order: 1,
    validators: [$IsString(), $IsLength({ max: 256 })],
  })
  // oidc fashion naming
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly instance_name: string;

  @Input({
    required: true,
    order: 2,
    validators: [$IsString(), $IsLength({ max: 256 })],
  })
  // oidc fashion naming
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly sp_name: string;

  @Input({
    order: 3,
    validators: [$IsLength({ max: 7 }), $IsNumeric()],
  })
  // oidc fashion naming
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly signup_id: string;

  @Input({
    required: true,
    order: 4,
    validators: [$IsWebsiteURL(), $IsLength({ max: 1024 })],
  })
  readonly site: string;

  /**
   * @TODO Ajout de la gestion des champs multiples (ex URLs) sur la lib dto2form
   * #1842
   */
  @Input({
    required: true,
    order: 5,
    validators: [$IsRedirectURL(), $IsLength({ max: 1024 })],
  })
  readonly redirect_uris: string;

  /**
   * @TODO Ajout de la gestion des champs multiples (ex URLs) sur la lib dto2form
   * #1842
   */
  @Input({
    required: true,
    order: 6,
    validators: [$IsRedirectURL(), $IsLength({ max: 1024 })],
  })
  readonly post_logout_redirect_uris: string;

  @Input({
    order: 7,
    validators: [$IsIpAddressesAndRange()],
  })
  readonly ipAddresses: string;

  @Input({
    required: true,
    order: 9,
    validators: [$IsString(), $IsSignedResponseAlg()],
    /**
     * @TODO Ajout de la gestion des champs multiples (ex URLs) sur la lib dto2form
     * #1842
     *
     * create custom validator to check value
     */
    // options: [
    //   {
    //     label: '',
    //     value: '',
    //   },
    //   {
    //     label: 'HS256',
    //     value: 'HS256',
    //   },
    //   {
    //     label: 'ES256',
    //     value: 'ES256',
    //   },
    //   {
    //     label: 'RS256',
    //     value: 'RS256',
    //   },
    // ],
  })
  // oidc fashion naming
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly signed_response_alg: string;

  /**
   * @TODO Ajout de la gestion des champs multiples (ex URLs) sur la lib dto2form
   * #1842
   *
   * See during the implementation of the values whether we should switch
   * from $IsString to $IsBoolean by adding a converter from string to number
   */
  @Input({
    required: true,
    order: 10,
    validators: [$IsString()],
  })
  // oidc fashion naming
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly use_entity_id: string;

  @Input({
    order: 11,
    validators: [$IsLength({ max: 64, min: 36 }), $Matches(/^[a-zA-Z0-9-]+$/)],
    validateIf: [],
  })
  // oidc fashion naming
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly entity_id: string;
}
