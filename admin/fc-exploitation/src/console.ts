import { BootstrapConsole } from 'nestjs-console';
import { AppModule } from './app.module';

BootstrapConsole.init({ module: AppModule })
  .then(({ app, boot }) => boot())
  .catch(e => {
    // We are in a CLI app
    // tslint:disable-next-line no-console
    console.error('Error', e);
  });
