import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module.js";
import { ConfigurationError, CoreConfig } from "./config.js";

let app: INestApplication | undefined;
try {
  app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  app.enableShutdownHooks();
  await app.listen(app.get(CoreConfig).port, "127.0.0.1");
  console.log(`Core listening ${await app.getUrl()}`);
} catch (error) {
  console.error(error instanceof ConfigurationError ? error.message : "Core startup failed");
  if (app) await app.close();
  process.exitCode = 1;
}
