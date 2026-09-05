import { timingSafeEqual } from "node:crypto";
import { Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { CoreConfig } from "./config.js";
import { failure } from "./errors.js";

@Injectable()
export class ServiceCredentialGuard implements CanActivate {
  constructor(private readonly config: CoreConfig, private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization ?? "";
    const matches = (token: string) => {
      const expected = Buffer.from(`Bearer ${token}`);
      const actual = Buffer.from(authorization);
      return actual.length === expected.length && timingSafeEqual(actual, expected);
    };
    if (matches(this.config.maintenanceToken)) return true;
    if (!matches(this.config.cmsToken)) throw failure(401, "unauthorized");
    if (request.method !== "GET" && request.method !== "HEAD") throw failure(403, "forbidden");
    // Internal maintenance reads are not CMS DTOs.
    if (this.reflector.getAllAndOverride("catalogMaintenance", [context.getHandler(), context.getClass()])) throw failure(403, "forbidden");
    return true;
  }
}
