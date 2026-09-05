import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";
import type { Response } from "express";

export const messages = {
  invalid_request: "Invalid request", unauthorized: "Valid service credential required", forbidden: "Credential does not permit this operation",
  product_not_found: "Product not found", not_found: "Route not found", product_incomplete: "Product has no track extension",
  reference_conflict: "Referenced category or color does not exist", write_conflict: "Product could not be saved",
  database_unavailable: "Database unavailable", internal_error: "Internal service error", payload_too_large: "Request body too large",
} as const;
type ErrorCode = keyof typeof messages;
export const failure = (statusCode: number, code: ErrorCode) => new HttpException({ statusCode, code, message: messages[code] }, statusCode);

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    let response: HttpException;
    if (error instanceof Error && "type" in error && error.type === "entity.too.large" && "status" in error && error.status === 413) {
      response = failure(413, "payload_too_large");
    } else if (error instanceof HttpException) {
      const status = error.getStatus();
      const body = error.getResponse();
      const code = typeof body === "object" && "code" in body ? body.code : undefined;
      response = failure(status, typeof code === "string" && Object.hasOwn(messages, code) ? code as ErrorCode : status === 404 ? "not_found" : status === 413 ? "payload_too_large" : "invalid_request");
    } else {
      const cause = error instanceof DrizzleQueryError ? error.cause : error;
      const databaseError = cause instanceof DatabaseError ? cause : undefined;
      const code = cause instanceof Error ? (cause as NodeJS.ErrnoException).code : undefined;
      console.error(JSON.stringify({ event: "request_failed", code: code ?? "unknown", constraint: databaseError?.constraint }));
      response = code === "23503" ? failure(409, "reference_conflict")
        : code === "23505" || code === "23514" ? failure(409, "write_conflict")
        : error instanceof DrizzleQueryError || databaseError || ["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT"].includes(code ?? "") ? failure(503, "database_unavailable")
        : failure(500, "internal_error");
    }
    host.switchToHttp().getResponse<Response>().status(response.getStatus()).json(response.getResponse());
  }
}
