import { Body, Controller, Get, Param, Patch, Post, Query, SetMetadata } from "@nestjs/common";
import { CatalogService } from "./catalog.service.js";
import { CreateProduct, PatchProduct, SearchQuery, ReferenceQuery, NoQuery, Uuid, inputPipe, paths, type CreateProductInput, type PatchProductInput, type SearchInput } from "./contract.js";

@SetMetadata("catalogMaintenance", true)
@Controller(paths.maintenance)
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}
  @Post()
  create(@Body(inputPipe(CreateProduct)) input: CreateProductInput) { return this.catalog.create(input); }
  @Get()
  search(@Query(inputPipe(SearchQuery)) query: SearchInput) { return this.catalog.search(query); }
  @Get(":id")
  get(@Param("id", inputPipe(Uuid)) id: string) { return this.catalog.get(id); }
  @Patch(":id")
  update(@Param("id", inputPipe(Uuid)) id: string, @Body(inputPipe(PatchProduct)) input: PatchProductInput) { return this.catalog.update(id, input); }
}

@Controller(paths.cms)
export class CmsCatalogController {
  constructor(private readonly catalog: CatalogService) {}
  @Get()
  search(@Query(inputPipe(SearchQuery)) query: SearchInput) { return this.catalog.search(query); }
  @Get(":id")
  get(@Param("id", inputPipe(Uuid)) id: string) { return this.catalog.cmsGet(id); }
}

@Controller(paths.references)
export class CatalogReferencesController {
  constructor(private readonly catalog: CatalogService) {}
  @Get("categories")
  categories(@Query(inputPipe(ReferenceQuery)) query: SearchInput) { return this.catalog.categoryReferences(query); }
  @Get("colors")
  colors(@Query(inputPipe(ReferenceQuery)) query: SearchInput) { return this.catalog.colorReferences(query); }
  @Get("standard-lengths")
  lengths(@Query(inputPipe(NoQuery)) _query: object) { return this.catalog.standardLengths(); }
}
