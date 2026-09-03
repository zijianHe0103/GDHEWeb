CREATE TABLE "catalog"."track_product_specs" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"product_spec_id" integer NOT NULL,
	"finished_length_mm" integer NOT NULL,
	CONSTRAINT "track_product_specs_product_spec_unique" UNIQUE("product_spec_id"),
	CONSTRAINT "track_product_specs_length_positive" CHECK ("catalog"."track_product_specs"."finished_length_mm" > 0)
);
--> statement-breakpoint
ALTER TABLE "publication"."pages" ADD COLUMN "current_published_version_id" integer;--> statement-breakpoint
ALTER TABLE "catalog"."track_product_specs" ADD CONSTRAINT "track_product_specs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."track_product_specs" ADD CONSTRAINT "track_product_specs_same_product_fk" FOREIGN KEY ("product_id","product_spec_id") REFERENCES "catalog"."product_specs"("product_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication"."pages" ADD CONSTRAINT "pages_current_published_version_same_page_fk" FOREIGN KEY ("id","current_published_version_id") REFERENCES "publication"."page_versions"("page_id","id") ON DELETE restrict ON UPDATE no action;