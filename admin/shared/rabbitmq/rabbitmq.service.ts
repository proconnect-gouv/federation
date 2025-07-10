import { ConfigService } from 'nestjs-config';
import { timeout } from 'rxjs/operators';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InstanceService } from '@fc/shared/utils';
import { RabbitmqFailureException } from './rabbitmq.failure.exception';

@Injectable()
export class RabbitmqService {
  constructor(
    private readonly config: ConfigService,
    @Inject('cryptography-broker') private broker: ClientProxy,
  ) {}

  async onModuleInit() {
    const { useHsm } = this.config.get('cryptography-broker');

    if (useHsm) {
      await this.broker.connect();
    }
  }

  onModuleDestroy() {
    const { useHsm } = this.config.get('cryptography-broker');

    if (useHsm) {
      this.broker.close();
    }
  }

  async publish(command: string, payload): Promise<string> {
    const { requestTimeout } = this.config.get('cryptography-broker');

    return new Promise((resolve, reject) => {
      // Build callbacks
      const success = this.success.bind(this, resolve, reject);
      const failure = this.failure.bind(this, reject);

      this.broker
        .send(command, payload)
        .pipe(timeout(requestTimeout))
        .subscribe(success, failure);
    });
  }

  private success(resolve, reject, response) {
    if (response === 'ERROR') {
      return this.failure(
        reject,
        new Error(
          'Received error from consumer. Check consumer logs for more infos',
        ),
      );
    }

    resolve(response);
  }

  private failure(reject, error) {
    reject(new RabbitmqFailureException(error));
  }
}
