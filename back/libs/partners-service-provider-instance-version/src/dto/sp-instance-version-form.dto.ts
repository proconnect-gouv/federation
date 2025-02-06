import { Expose } from 'class-transformer';

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
import {
  OidcClientInterface,
  SignatureAlgorithmEnum,
} from '@fc/service-provider';

@Form()
export class ServiceProviderInstanceVersionDto
  extends FormDtoBase
  implements Partial<OidcClientInterface>
{
  @Input({
    required: true,
    order: 2,
    validators: [$IsString(), $IsLength({ max: 256 })],
  })
  @Expose()
  readonly name: string;

  @Input({
    order: 3,
    validators: [$IsLength({ max: 7 }), $IsNumeric()],
  })
  @Expose()
  readonly signupId: string;

  @Input({
    required: true,
    array: true,
    order: 4,
    validators: [$IsWebsiteURL(), $IsLength({ max: 1024 })],
  })
  @Expose()
  readonly site: string[];

  /**
   * @TODO Ajout de la gestion des champs multiples (ex URLs) sur la lib dto2form
   * #1842
   */
  @Input({
    required: true,
    array: true,
    order: 5,
    validators: [$IsRedirectURL(), $IsLength({ max: 1024 })],
  })
  @Expose()
  readonly redirect_uris: string[];

  /**
   * @TODO Ajout de la gestion des champs multiples (ex URLs) sur la lib dto2form
   * #1842
   */
  @Input({
    required: true,
    array: true,
    order: 6,
    validators: [$IsRedirectURL(), $IsLength({ max: 1024 })],
  })
  @Expose()
  readonly post_logout_redirect_uris: string[];

  @Input({
    order: 7,
    array: true,
    validators: [$IsIpAddressesAndRange()],
  })
  @Expose()
  readonly IPServerAddressesAndRanges: string[];

  @Input({
    required: true,
    order: 9,
    validators: [$IsString(), $IsSignedResponseAlg()],
  })
  @Expose()
  readonly id_token_signed_response_alg: SignatureAlgorithmEnum;

  @Input({
    order: 11,
    validators: [$IsLength({ max: 64, min: 36 }), $Matches(/^[a-zA-Z0-9-]+$/)],
  })
  @Expose()
  readonly entityId: string;
}
