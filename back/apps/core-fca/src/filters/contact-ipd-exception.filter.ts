import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { ApiErrorMessage } from '@fc/app';
import { ConfigService } from '@fc/config';
import { CoreConfig } from '@fc/core';
import { UserSession } from '@fc/core-fca';
import { FcWebHtmlExceptionFilter } from '@fc/exceptions';
import { ExceptionCaughtEvent } from '@fc/exceptions/events';
import { generateErrorId, getClass } from '@fc/exceptions/helpers';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { ViewTemplateService } from '@fc/view-templates';

import { CoreFcaInvalidIdentityException } from '../exceptions';

@Catch(CoreFcaInvalidIdentityException)
@Injectable()
export class ContactIpdExceptionFilter
  extends FcWebHtmlExceptionFilter
  implements ExceptionFilter
{
  // eslint-disable-next-line max-params
  constructor(
    protected readonly config: ConfigService,
    protected readonly logger: LoggerService,
    protected readonly eventBus: EventBus,
    protected readonly viewTemplate: ViewTemplateService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly sessionService: SessionService,
  ) {
    super(config, logger, eventBus, viewTemplate);
  }

  async catch(exception: CoreFcaInvalidIdentityException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const exceptionConstructor = getClass(exception);

    const code = this.getExceptionCodeFor(exception);
    const id = generateErrorId();
    const message = exceptionConstructor.UI;

    // @todo: weird Naming / structure
    const errorMessage: ApiErrorMessage = { code, id, message };
    const exceptionParam = this.getParams(exception, errorMessage, res);

    this.logException(code, id, exception);

    this.eventBus.publish(new ExceptionCaughtEvent(exception, { req }));

    const contactEmail = await this.getContactEmail();
    const validationConstraints = JSON.stringify(
      exception.validationErrors.map((error) => error?.constraints),
    );
    const validationTarget = JSON.stringify(
      exception.validationErrors[0]?.target,
    ); // same target for all validation errors
    const body = encodeURIComponent(
      `Bonjour,
Voici une erreur remontée par ProConnect suite à une tentative de connexion infructueuse.
${validationConstraints}
Voici l’identité telle que reçue par ProConnect :
${validationTarget}
ProConnect a vérifié que l’erreur ne venait pas de leur côté.
Merci de corriger mes informations d'identité afin que ProConnect reconnaisse mon identité et que je puisse me connecter.
Cordialement,`,
    );
    const subject = 'Mise à jour de mon profil pour compatibilité ProConnect';
    exception.contactHref = `mailto:${contactEmail}?subject=${subject}&body=${body}`;

    /**
     * Interceptors are not run in case of route not handled by our app (404)
     * So we need to manually bind template helpers.
     */
    this.viewTemplate.bindMethodsToResponse(res);

    res.status(this.getHttpStatus(exception));
    res.render('error', exceptionParam);
  }

  protected async getContactEmail() {
    const session = this.sessionService.get<UserSession>('User') || {};
    let contactEmail: string;

    if (session?.idpId) {
      const identityProvider = await this.identityProvider.getById(
        session.idpId,
      );
      contactEmail = identityProvider.supportEmail;
    }

    if (!contactEmail) {
      contactEmail = this.config.get<CoreConfig>('Core').supportEmail;
    }

    return contactEmail;
  }
}
