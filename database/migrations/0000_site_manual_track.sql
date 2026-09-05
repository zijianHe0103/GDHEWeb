CREATE SCHEMA "catalog";
--> statement-breakpoint
CREATE SCHEMA "site";
--> statement-breakpoint
CREATE TABLE "catalog"."categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"parent_id" uuid,
	"code" text NOT NULL,
	"name_zh" text NOT NULL,
	"name_en" text NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_code_unique" UNIQUE("code"),
	CONSTRAINT "categories_not_own_parent" CHECK ("catalog"."categories"."parent_id" IS NULL OR "catalog"."categories"."parent_id" <> "catalog"."categories"."id"),
	CONSTRAINT "categories_names_nonblank" CHECK (btrim("catalog"."categories"."code") <> '' AND btrim("catalog"."categories"."name_zh") <> '' AND btrim("catalog"."categories"."name_en") <> ''),
	CONSTRAINT "categories_status_valid" CHECK ("catalog"."categories"."status" IN ('active', 'inactive'))
);
--> statement-breakpoint
CREATE TABLE "catalog"."colors" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name_zh" text NOT NULL,
	"name_en" text NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "colors_code_unique" UNIQUE("code"),
	CONSTRAINT "colors_names_nonblank" CHECK (btrim("catalog"."colors"."code") <> '' AND btrim("catalog"."colors"."name_zh") <> '' AND btrim("catalog"."colors"."name_en") <> ''),
	CONSTRAINT "colors_status_valid" CHECK ("catalog"."colors"."status" IN ('active', 'inactive'))
);
--> statement-breakpoint
CREATE TABLE "catalog"."product_colors" (
	"product_id" uuid NOT NULL,
	"color_id" uuid NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_colors_pk" PRIMARY KEY("product_id","color_id"),
	CONSTRAINT "product_colors_status_valid" CHECK ("catalog"."product_colors"."status" IN ('active', 'inactive')),
	CONSTRAINT "product_colors_order_nonnegative" CHECK ("catalog"."product_colors"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "catalog"."products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"family_code" text NOT NULL,
	"model" text NOT NULL,
	"name_zh" text NOT NULL,
	"name_en" text NOT NULL,
	"primary_category_id" uuid NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_family_valid" CHECK ("catalog"."products"."family_code" = 'track'),
	CONSTRAINT "products_names_nonblank" CHECK (btrim("catalog"."products"."model") <> '' AND btrim("catalog"."products"."name_zh") <> '' AND btrim("catalog"."products"."name_en") <> ''),
	CONSTRAINT "products_status_valid" CHECK ("catalog"."products"."status" IN ('active', 'inactive'))
);
--> statement-breakpoint
CREATE TABLE "site"."sites" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sites_key_unique" UNIQUE("key"),
	CONSTRAINT "sites_key_nonblank" CHECK (btrim("site"."sites"."key") <> ''),
	CONSTRAINT "sites_status_valid" CHECK ("site"."sites"."status" IN ('active', 'inactive'))
);
--> statement-breakpoint
CREATE TABLE "catalog"."track_products" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"allows_custom_length" boolean NOT NULL,
	"quantity_unit" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "track_products_unit_valid" CHECK ("catalog"."track_products"."quantity_unit" = 'piece')
);
--> statement-breakpoint
CREATE TABLE "catalog"."track_standard_lengths" (
	"length_mm" integer PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "track_standard_lengths_positive" CHECK ("catalog"."track_standard_lengths"."length_mm" > 0),
	CONSTRAINT "track_standard_lengths_order_nonnegative" CHECK ("catalog"."track_standard_lengths"."sort_order" >= 0),
	CONSTRAINT "track_standard_lengths_status_valid" CHECK ("catalog"."track_standard_lengths"."status" IN ('active', 'inactive'))
);
--> statement-breakpoint
ALTER TABLE "catalog"."categories" ADD CONSTRAINT "categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "catalog"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_colors" ADD CONSTRAINT "product_colors_product_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_colors" ADD CONSTRAINT "product_colors_color_fk" FOREIGN KEY ("color_id") REFERENCES "catalog"."colors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."products" ADD CONSTRAINT "products_category_fk" FOREIGN KEY ("primary_category_id") REFERENCES "catalog"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."track_products" ADD CONSTRAINT "track_products_product_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE restrict ON UPDATE no action;