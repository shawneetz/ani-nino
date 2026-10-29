CREATE TYPE "public"."event_precision" AS ENUM('day', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."location_precision" AS ENUM('municipality', 'city', 'province', 'area');--> statement-breakpoint
CREATE TYPE "public"."pin_badge" AS ENUM('law_or_decree', 'court_record', 'government_record', 'academic_research', 'advocacy_report', 'news_report');--> statement-breakpoint
CREATE TYPE "public"."pin_family" AS ENUM('land_reform', 'export_tax_monopoly', 'infrastructure', 'displacement', 'labor', 'public_services');--> statement-breakpoint
CREATE TYPE "public"."pin_layer" AS ENUM('martial_law', 'today');--> statement-breakpoint
CREATE TYPE "public"."pin_status" AS ENUM('lead', 'verified');--> statement-breakpoint
CREATE TYPE "public"."province" AS ENUM('abra', 'agusan-del-norte', 'agusan-del-sur', 'aklan', 'albay', 'antique', 'apayao', 'aurora', 'basilan', 'bataan', 'batanes', 'batangas', 'benguet', 'biliran', 'bohol', 'bukidnon', 'bulacan', 'cagayan', 'camarines-norte', 'camarines-sur', 'camiguin', 'capiz', 'catanduanes', 'cavite', 'cebu', 'cotabato', 'davao-de-oro', 'davao-del-norte', 'davao-del-sur', 'davao-occidental', 'davao-oriental', 'dinagat-islands', 'eastern-samar', 'guimaras', 'ifugao', 'ilocos-norte', 'ilocos-sur', 'iloilo', 'isabela', 'kalinga', 'la-union', 'laguna', 'lanao-del-norte', 'lanao-del-sur', 'leyte', 'maguindanao-del-norte', 'maguindanao-del-sur', 'marinduque', 'masbate', 'misamis-occidental', 'misamis-oriental', 'mountain-province', 'negros-occidental', 'negros-oriental', 'northern-samar', 'nueva-ecija', 'nueva-vizcaya', 'occidental-mindoro', 'oriental-mindoro', 'palawan', 'pampanga', 'pangasinan', 'quezon', 'quirino', 'rizal', 'romblon', 'samar', 'sarangani', 'siquijor', 'sorsogon', 'south-cotabato', 'southern-leyte', 'sultan-kudarat', 'sulu', 'surigao-del-norte', 'surigao-del-sur', 'tarlac', 'tawi-tawi', 'zambales', 'zamboanga-del-norte', 'zamboanga-del-sur', 'zamboanga-sibugay', 'metro-manila');--> statement-breakpoint
CREATE TYPE "public"."source_kind" AS ENUM('law_or_decree', 'court_decision', 'government_release', 'period_publication', 'archive', 'academic', 'news', 'advocacy_publication', 'video');--> statement-breakpoint
CREATE TYPE "public"."source_role" AS ENUM('promise', 'record', 'context');--> statement-breakpoint
CREATE TABLE "pin_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"pin_id" text NOT NULL,
	"event_date" date NOT NULL,
	"precision" "event_precision" DEFAULT 'month' NOT NULL,
	"description" text NOT NULL,
	"source_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pin_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"today_pin_id" text NOT NULL,
	"today_layer" "pin_layer" DEFAULT 'today' NOT NULL,
	"past_pin_id" text NOT NULL,
	"past_layer" "pin_layer" DEFAULT 'martial_law' NOT NULL,
	"interpretation_note" text NOT NULL,
	CONSTRAINT "pin_links_pair_uq" UNIQUE("today_pin_id","past_pin_id"),
	CONSTRAINT "pin_links_today_layer" CHECK ("pin_links"."today_layer" = 'today'),
	CONSTRAINT "pin_links_past_layer" CHECK ("pin_links"."past_layer" = 'martial_law'),
	CONSTRAINT "pin_links_note_not_empty" CHECK (length(trim("pin_links"."interpretation_note")) > 0)
);
--> statement-breakpoint
CREATE TABLE "pin_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"pin_id" text NOT NULL,
	"name" text NOT NULL,
	"municipality" text,
	"province" "province" NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"precision" "location_precision" DEFAULT 'municipality' NOT NULL,
	"is_anchor" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "pin_locations_lat" CHECK ("pin_locations"."lat" BETWEEN 4.5 AND 21.5),
	CONSTRAINT "pin_locations_lng" CHECK ("pin_locations"."lng" BETWEEN 116 AND 127),
	CONSTRAINT "pin_locations_name_not_empty" CHECK (length(trim("pin_locations"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "pin_sources" (
	"pin_id" text NOT NULL,
	"source_id" text NOT NULL,
	"role" "source_role" NOT NULL,
	"citation_note" text,
	CONSTRAINT "pin_sources_pin_id_source_id_role_pk" PRIMARY KEY("pin_id","source_id","role")
);
--> statement-breakpoint
CREATE TABLE "pins" (
	"id" text PRIMARY KEY NOT NULL,
	"layer" "pin_layer" NOT NULL,
	"title" text NOT NULL,
	"program" text,
	"instruments" text[] DEFAULT '{}'::text[] NOT NULL,
	"family" "pin_family" NOT NULL,
	"secondary_families" "pin_family"[] DEFAULT '{}'::pin_family[] NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"date_label" text NOT NULL,
	"promise" text,
	"record" text,
	"badge" "pin_badge",
	"status" "pin_status" NOT NULL,
	"open_question" text,
	"verified_on" date,
	"verification_note" text,
	CONSTRAINT "pins_id_layer_uq" UNIQUE("id","layer"),
	CONSTRAINT "pins_id_slug" CHECK ("pins"."id" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "pins_start_first_of_month" CHECK (EXTRACT(DAY FROM "pins"."start_date") = 1),
	CONSTRAINT "pins_end_first_of_month" CHECK ("pins"."end_date" IS NULL OR EXTRACT(DAY FROM "pins"."end_date") = 1),
	CONSTRAINT "pins_end_after_start" CHECK ("pins"."end_date" IS NULL OR "pins"."end_date" >= "pins"."start_date"),
	CONSTRAINT "pins_martial_law_window" CHECK ("pins"."layer" <> 'martial_law' OR ("pins"."start_date" >= DATE '1972-09-01' AND "pins"."start_date" <= DATE '1986-02-01')),
	CONSTRAINT "pins_today_after_martial_law" CHECK ("pins"."layer" <> 'today' OR "pins"."start_date" >= DATE '1986-03-01'),
	CONSTRAINT "pins_lead_needs_question" CHECK ("pins"."status" <> 'lead' OR "pins"."open_question" IS NOT NULL),
	CONSTRAINT "pins_verified_complete" CHECK ("pins"."status" <> 'verified' OR ("pins"."verified_on" IS NOT NULL AND "pins"."record" IS NOT NULL AND "pins"."badge" IS NOT NULL)),
	CONSTRAINT "pins_primary_not_in_secondary" CHECK (NOT ("pins"."family" = ANY("pins"."secondary_families")))
);
--> statement-breakpoint
CREATE TABLE "seed_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"git_sha" text,
	"seeded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"publisher" text NOT NULL,
	"author" text,
	"kind" "source_kind" NOT NULL,
	"url" text,
	"archived_url" text,
	"published_year" integer,
	"accessed_on" date,
	"note" text,
	CONSTRAINT "sources_id_slug" CHECK ("sources"."id" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "sources_url_needs_accessed" CHECK (("sources"."url" IS NULL AND "sources"."archived_url" IS NULL) OR "sources"."accessed_on" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" text PRIMARY KEY NOT NULL,
	"pin_id" text,
	"youtube_id" text NOT NULL,
	"title" text NOT NULL,
	"channel" text NOT NULL,
	"credit_line" text NOT NULL,
	"url" text,
	"note" text,
	CONSTRAINT "videos_youtube_id_uq" UNIQUE("youtube_id"),
	CONSTRAINT "videos_id_slug" CHECK ("videos"."id" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "videos_youtube_id_format" CHECK ("videos"."youtube_id" ~ '^[A-Za-z0-9_-]{11}$')
);
--> statement-breakpoint
ALTER TABLE "pin_events" ADD CONSTRAINT "pin_events_pin_id_pins_id_fk" FOREIGN KEY ("pin_id") REFERENCES "public"."pins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pin_events" ADD CONSTRAINT "pin_events_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pin_links" ADD CONSTRAINT "pin_links_today_pin_layer_fk" FOREIGN KEY ("today_pin_id","today_layer") REFERENCES "public"."pins"("id","layer") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pin_links" ADD CONSTRAINT "pin_links_past_pin_layer_fk" FOREIGN KEY ("past_pin_id","past_layer") REFERENCES "public"."pins"("id","layer") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pin_locations" ADD CONSTRAINT "pin_locations_pin_id_pins_id_fk" FOREIGN KEY ("pin_id") REFERENCES "public"."pins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pin_sources" ADD CONSTRAINT "pin_sources_pin_id_pins_id_fk" FOREIGN KEY ("pin_id") REFERENCES "public"."pins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pin_sources" ADD CONSTRAINT "pin_sources_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_pin_id_pins_id_fk" FOREIGN KEY ("pin_id") REFERENCES "public"."pins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pin_locations_one_anchor" ON "pin_locations" USING btree ("pin_id") WHERE "pin_locations"."is_anchor";