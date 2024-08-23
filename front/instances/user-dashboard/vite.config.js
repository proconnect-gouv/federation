import { defineConfig, loadEnv, mergeConfig } from 'vite';

import defaultConfig from '@fc/react-app/vite.config';

// @NOTE: Jest and Istanbul currently lack support for ESM modules.
// As a result, 'import.meta.env' is not usable.
// Environment variables must be declared directly in the Vite config.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const envConfig = {
    define: {
      // @NOTE we must ensure env variables are correctly formatted as JavaScript string literals
      'process.env.IS_FRAUD_FORM_FEATURE_ENABLED': JSON.stringify(
        env.IS_FRAUD_FORM_FEATURE_ENABLED,
      ),
      'process.env.SUPPORT_FORM_URL': JSON.stringify(env.SUPPORT_FORM_URL),
    },
  };
  return mergeConfig(defaultConfig, envConfig);
});
