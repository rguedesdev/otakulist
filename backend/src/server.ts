import mongoose from "mongoose";

import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const app = await buildApp();

async function shutdown(signal: string) {
  app.log.info({ signal }, "Encerrando servidor");
  await app.close();
  await mongoose.disconnect();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void shutdown(signal).finally(() => process.exit(0));
  });
}

try {
  await mongoose.connect(env.MONGODB_URI);
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (error) {
  app.log.error(error);
  await mongoose.disconnect();
  process.exit(1);
}
