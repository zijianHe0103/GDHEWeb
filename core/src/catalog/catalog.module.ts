import { Module } from "@nestjs/common";
import { CatalogController, CmsCatalogController, CatalogReferencesController } from "./catalog.controller.js";
import { CatalogService } from "./catalog.service.js";

@Module({ controllers: [CatalogController, CmsCatalogController, CatalogReferencesController], providers: [CatalogService], exports: [CatalogService] })
export class CatalogModule {}
