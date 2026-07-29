import { createApp, envSchema } from "./app.ts";

const config = envSchema.parse(process.env);
const { app } = createApp(config);

app.listen(config.PORT, () => {
  console.log(`App listening on port ${config.PORT}`);
});
