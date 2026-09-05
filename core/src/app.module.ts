import { Controller, Get, Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { DatabaseConnection, DatabaseModule } from "./database.js";
import { CatalogModule } from "./catalog/catalog.module.js";
import { ServiceCredentialGuard } from "./auth.guard.js";
import { HttpErrorFilter } from "./errors.js";
import { openapi } from "./catalog/contract.js";

@Controller("health")
class HealthController {
  constructor(private readonly connection: DatabaseConnection) {}
  @Get("ready")
  async ready() { await this.connection.ready(); return { status: "ready" }; }
}

@Controller()
class ApiDescriptionController {
  @Get("openapi.json")
  document() { return openapi; }
}

@Module({
  imports: [DatabaseModule, CatalogModule], controllers: [HealthController, ApiDescriptionController],
  providers: [{ provide: APP_GUARD, useClass: ServiceCredentialGuard }, { provide: APP_FILTER, useClass: HttpErrorFilter }],
})
export class AppModule {}
