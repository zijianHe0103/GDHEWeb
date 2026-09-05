import { Global, Injectable, Module, type OnModuleInit, type OnApplicationShutdown } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "@gdhe/database";
import { CoreConfig } from "./config.js";

@Injectable()
export class DatabaseConnection implements OnModuleInit, OnApplicationShutdown {
  private readonly pool: Pool;
  readonly db;

  constructor(config: CoreConfig) {
    this.pool = new Pool({
      connectionString: config.databaseUrl, max: 5,
      connectionTimeoutMillis: 3000, statement_timeout: 5000,
      application_name: "gdhe-core-catalog",
    });
    this.pool.on("error", (error) => console.error(JSON.stringify({ event: "database_pool_error", code: (error as NodeJS.ErrnoException).code ?? "unknown" })));
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    try { await this.ready(); }
    catch (error) {
      console.error(JSON.stringify({ event: "database_startup_failed" }));
      await this.pool.end();
      throw error;
    }
  }

  async ready() { await this.db.execute(sql`SELECT 1 FROM catalog.products LIMIT 1`); }
  async onApplicationShutdown() { await this.pool.end(); }
}

@Global()
@Module({ providers: [CoreConfig, DatabaseConnection], exports: [CoreConfig, DatabaseConnection] })
export class DatabaseModule {}
