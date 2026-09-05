import { Injectable } from "@nestjs/common";

export class ConfigurationError extends Error {}

@Injectable()
export class CoreConfig {
  readonly databaseUrl: string;
  readonly port: number;
  readonly maintenanceToken: string;
  readonly cmsToken: string;

  constructor() {
    const value = process.env.CORE_DATABASE_URL;
    if (!value) throw new ConfigurationError("CORE_DATABASE_URL is required");
    let parsed: URL;
    try { parsed = new URL(value); }
    catch { throw new ConfigurationError("CORE_DATABASE_URL is invalid"); }
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) || parsed.pathname.length < 2) {
      throw new ConfigurationError("CORE_DATABASE_URL must target an explicit local PostgreSQL database");
    }
    this.databaseUrl = value;
    const port = process.env.CORE_PORT ?? "3100";
    if (!/^\d{1,5}$/.test(port) || Number(port) > 65535) throw new ConfigurationError("CORE_PORT is invalid");
    this.port = Number(port);
    this.maintenanceToken = this.token("CATALOG_MAINTENANCE_TOKEN");
    this.cmsToken = this.token("CATALOG_CMS_TOKEN");
    if (this.maintenanceToken === this.cmsToken) throw new ConfigurationError("Catalog credentials must differ");
  }

  private token(name: string) {
    const value = process.env[name];
    if (!value || !/^[A-Za-z0-9_-]{32,256}$/.test(value)) throw new ConfigurationError(`${name} must be a 32..256 character service credential`);
    return value;
  }
}
