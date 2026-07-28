import { z } from "zod";

export const envSchema = z.object({
  APP_NAME: z.string().optional(),
  FQDN: z.string().min(1),
  PORT: z.coerce.number().int().positive().optional().default(3000),
  STYLESHEET_URL: z
    .string()
    .optional()
    .default(
      "https://cdn.jsdelivr.net/gh/raj457036/attriCSS@master/themes/brightlight-green.css",
    ),
  ServiceProviderAdapterEnv_CLIENT_ID: z.string().min(1),
  ServiceProviderAdapterEnv_CLIENT_SECRET: z.string().min(1),
  ServiceProviderAdapterEnv_ID_TOKEN_SIGNED_RESPONSE_ALG: z.string().min(1),
  ServiceProviderAdapterEnv_POST_LOGOUT_REDIRECT_URIS: z
    .string()
    .min(1)
    .transform((s) => JSON.parse(s) as string[]),
  ServiceProviderAdapterEnv_REDIRECT_URIS: z
    .string()
    .min(1)
    .transform((s) => JSON.parse(s) as string[]),
  ServiceProviderAdapterEnv_SCOPE: z.string().min(1),
  ServiceProviderAdapterEnv_USERINFO_SIGNED_RESPONSE_ALG: z.string().min(1),
});

export type EnvConfig = z.infer<typeof envSchema>;
