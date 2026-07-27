import { createApp, envSchema } from "./app.ts";
import process from "node:process";

const config = envSchema.parse(process.env);
const { app } = await createApp(config);

app.listen(config.PORT, () => {
  console.log(`App listening on port ${config.PORT}`);
});
