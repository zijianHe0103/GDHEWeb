CREATE SCHEMA "catalog";
--> statement-breakpoint
CREATE SCHEMA "publication";
--> statement-breakpoint
CREATE SCHEMA "rfq";
--> statement-breakpoint
CREATE TABLE "rfq"."idempotency_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"scope" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"request_hash" text NOT NULL,
	"request_id" integer,
	"response_document" jsonb,
	CONSTRAINT "idempotency_records_scope_key_unique" UNIQUE("scope","idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "publication"."page_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"version_number" integer NOT NULL,
	"published_document" jsonb NOT NULL,
	CONSTRAINT "page_versions_page_version_unique" UNIQUE("page_id","version_number"),
	CONSTRAINT "page_versions_page_id_id_unique" UNIQUE("page_id","id"),
	CONSTRAINT "page_versions_version_positive" CHECK ("publication"."page_versions"."version_number" > 0)
);
--> statement-breakpoint
CREATE TABLE "publication"."pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "catalog"."product_specs" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"spec_code" text NOT NULL,
	CONSTRAINT "product_specs_product_spec_code_unique" UNIQUE("product_id","spec_code"),
	CONSTRAINT "product_specs_product_id_id_unique" UNIQUE("product_id","id")
);
--> statement-breakpoint
CREATE TABLE "catalog"."products" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_code" text NOT NULL,
	CONSTRAINT "products_product_code_unique" UNIQUE("product_code")
);
--> statement-breakpoint
CREATE TABLE "rfq"."request_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"line_number" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"line_snapshot" jsonb NOT NULL,
	CONSTRAINT "request_lines_request_line_unique" UNIQUE("request_id","line_number"),
	CONSTRAINT "request_lines_quantity_positive" CHECK ("rfq"."request_lines"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "rfq"."requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_reference" text NOT NULL,
	CONSTRAINT "requests_public_reference_unique" UNIQUE("public_reference")
);
--> statement-breakpoint
ALTER TABLE "rfq"."idempotency_records" ADD CONSTRAINT "idempotency_records_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "rfq"."requests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication"."page_versions" ADD CONSTRAINT "page_versions_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "publication"."pages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_specs" ADD CONSTRAINT "product_specs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq"."request_lines" ADD CONSTRAINT "request_lines_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "rfq"."requests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq"."request_lines" ADD CONSTRAINT "request_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE restrict ON UPDATE no action;