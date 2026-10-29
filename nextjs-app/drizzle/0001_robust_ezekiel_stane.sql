CREATE TYPE "public"."chart_type" AS ENUM('line', 'bar');--> statement-breakpoint
CREATE TYPE "public"."gap_kind" AS ENUM('method', 'data_missing', 'unverified', 'scope');--> statement-breakpoint
CREATE TYPE "public"."gap_status" AS ENUM('open', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."chart_qualifier" AS ENUM('exact', 'approx', 'at_most', 'at_least');--> statement-breakpoint
CREATE TYPE "public"."series_kind" AS ENUM('actual', 'target');--> statement-breakpoint
CREATE TABLE "chart_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"x_label" text NOT NULL,
	"x_date" date,
	"value" double precision NOT NULL,
	"qualifier" chart_qualifier DEFAULT 'exact' NOT NULL,
	"badge" "pin_badge" NOT NULL,
	"note" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"source_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chart_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"chart_id" text NOT NULL,
	"name" text NOT NULL,
	"kind" "series_kind" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"chart_type" chart_type NOT NULL,
	"x_label" text,
	"y_label" text,
	"unit" text,
	"caveat" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_gaps" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" "gap_kind" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"pin_id" text,
	"status" "gap_status" DEFAULT 'open' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "research_gaps_id_slug" CHECK ("research_gaps"."id" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "start_seconds" integer;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "chart_points" ADD CONSTRAINT "chart_points_series_id_chart_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."chart_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_points" ADD CONSTRAINT "chart_points_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_series" ADD CONSTRAINT "chart_series_chart_id_charts_id_fk" FOREIGN KEY ("chart_id") REFERENCES "public"."charts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_gaps" ADD CONSTRAINT "research_gaps_pin_id_pins_id_fk" FOREIGN KEY ("pin_id") REFERENCES "public"."pins"("id") ON DELETE set null ON UPDATE no action;