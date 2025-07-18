import { ArgumentsHost } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import {
  AsyncLocalStorageRequestInterface,
  AsyncLocalStorageService,
} from '@fc/async-local-storage';
import { BaseException } from '@fc/base-exception';
import { NestJsDependencyInjectionWrapper } from '@fc/common';

import { ExceptionOccurredCommand } from '../commands';

export async function throwException(exception: BaseException) {
  const commandBus =
    NestJsDependencyInjectionWrapper.get<CommandBus>(CommandBus);

  const asyncLocalStorage = NestJsDependencyInjectionWrapper.get<
    AsyncLocalStorageService<AsyncLocalStorageRequestInterface>
  >(AsyncLocalStorageService);

  const request = asyncLocalStorage.get('request');
  const response = asyncLocalStorage.get('response');

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as ArgumentsHost;

  const command = new ExceptionOccurredCommand(exception, host);

  await commandBus.execute(command);
}
