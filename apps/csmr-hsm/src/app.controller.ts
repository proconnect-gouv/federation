import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoggerService } from '@fc/logger';
/**
 * Temporary implementation
 * @TODO deploy a container with softHSM
 * and use this service as our HSM for test purpose.
 *
 * We would then be able to use real hsm module:
 * import { HsmService } from '@fc/hsm';
 */
import { FakeHsmService } from '@fc/fake-hsm';
import { SignPayloadDto } from './dto';
import { AppSignException } from './exceptions';
import { ConfigService } from '@fc/config';
import { RabbitmqConfig } from '@fc/rabbitmq';
import { ValidationException } from '@fc/error';
import { CryptoProtocol } from '@fc/protocol';

const BROKER_NAME = 'CryptographyBroker';

@Controller()
export class AppController {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly hsm: FakeHsmService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @MessagePattern(CryptoProtocol.Commands.SIGN)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: ValidationException.factory,
    }),
  )
  async sign(@Payload() payload: SignPayloadDto) {
    this.logger.debug(`received new ${CryptoProtocol.Commands.SIGN} command`);

    const { payloadEncoding } = this.config.get<RabbitmqConfig>(BROKER_NAME);
    const { data, digest } = payload;

    try {
      const dataBuffer = Buffer.from(data, payloadEncoding);
      const signedBuffer = await this.hsm.sign(dataBuffer, digest);
      const signed = signedBuffer.toString(payloadEncoding);
      return signed;
    } catch (error) {
      this.logger.error(new AppSignException(error));
      return 'ERROR';
    }
  }
}
