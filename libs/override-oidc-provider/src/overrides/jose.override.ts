/**
 * This file triggers override of native or installed libraries
 *
 * We need to override some components of JOSE to use HSM instead of native node crypto
 */
import { OverrideCode } from '../helpers';

/**
 * Wrap JOSE function:
 * Native crypto is synchron, thus calls in JOSE are all synchron as well.
 * We need to make the "pipeline" async to await response from HSM
 */

/**
 * oidc-provider overrides
 * Side note: oidc-provider uses async method, so we do not need to override anything inside
 */
import * as Base64 from 'jose/lib/help/base64url';
OverrideCode.wrap(Base64, 'encodeBuffer');

import * as Help from 'jose/lib/help/ecdsa_signatures';
OverrideCode.wrap(Help, 'derToJose');

import * as JwsSerializer from 'jose/lib/jws/serializers';
OverrideCode.wrap(JwsSerializer, 'compact', 'JWS.compact');
/**
 * JOSE's serializer methods have a `validate` method.
 * OverrideCode does not handle this special case for us
 * so we need to bind the property ourselves
 */
JwsSerializer.compact.validate = OverrideCode.getOriginal(
  'JWS.compact',
).validate;
