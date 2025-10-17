import { CommandHandler } from '@nestjs/cqrs';

import { ApiContentType } from '@fc/app';
import { ExceptionOccurredCommand } from '@fc/exceptions/commands';
import { FcWebHtmlExceptionFilter } from '@fc/exceptions/filters';
import { ExceptionOccurredHandler as BaseExceptionOccurredHandler } from '@fc/exceptions/handlers';

import { OidcProviderBaseRenderedException } from '../exceptions';
import {
  OidcProviderRenderedHtmlExceptionFilter,
  OidcProviderRenderedJsonExceptionFilter,
} from '../filters';

/**
 * @deprecated let oidc-provider handle errors
 */
@CommandHandler(ExceptionOccurredCommand)
export class ExceptionOccurredHandler extends BaseExceptionOccurredHandler {
  constructor(
    protected readonly htmlFilter: OidcProviderRenderedHtmlExceptionFilter,
    protected readonly jsonFilter: OidcProviderRenderedJsonExceptionFilter,
    protected readonly defaultFilter: FcWebHtmlExceptionFilter,
  ) {
    super(htmlFilter, jsonFilter);
  }

  execute(command: ExceptionOccurredCommand) {
    if (command.exception instanceof OidcProviderBaseRenderedException) {
      const contentType = this.getContentType(
        command.host.switchToHttp().getResponse(),
      );

      if (contentType === ApiContentType.JSON) {
        return this.jsonFilter.catch(command.exception, command.host);
      } else {
        return this.htmlFilter.catch(command.exception, command.host);
      }
    }
    return this.defaultFilter.catch(command.exception, command.host);
  }
}
