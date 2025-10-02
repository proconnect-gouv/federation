import { BootstrapConsole } from 'nestjs-console';
import { AppModule } from './app.module';

const bootstrapConsole = new BootstrapConsole({ module: AppModule });

bootstrapConsole
  .create()
  .then(({ init }) => init())
  .catch((e) => {
    // We are in a CLI app
    // tslint:disable-next-line no-console
    console.error('Error', e);
  });
