CREATE TABLE "micro_markets" (
	"name" text PRIMARY KEY NOT NULL,
	"min_rate" integer NOT NULL,
	"max_rate" integer NOT NULL,
	"description" text NOT NULL,
	"guideline_rate_per_sq_ft" integer,
	"guideline_source" text,
	"guideline_updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_id" uuid,
	"subscription_id" uuid,
	"channel" text NOT NULL,
	"contact" text NOT NULL,
	"status" text NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" text DEFAULT 'project' NOT NULL,
	"project_id" text,
	"market_name" text,
	"source" text NOT NULL,
	"document_type" text NOT NULL,
	"source_url" text,
	"raw_title" text NOT NULL,
	"raw_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"content_hash" text NOT NULL,
	"proposed_changes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ai_summary_what_changed" text NOT NULL,
	"ai_summary_what_it_means" text NOT NULL,
	"recommended_status" text,
	"confidence_score" real DEFAULT 0 NOT NULL,
	"analyzer" text DEFAULT 'rules' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewer_note" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"date" text NOT NULL,
	"type" text NOT NULL,
	"document_type" text,
	"source" text,
	"source_url" text,
	"what_changed" text NOT NULL,
	"what_it_means" text NOT NULL,
	"status_after" text,
	"pending_update_id" uuid,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"developer" text,
	"location" text NOT NULL,
	"micro_market" text NOT NULL,
	"rera_id" text NOT NULL,
	"rera_status" text NOT NULL,
	"rera_valid_until" text,
	"escrow_account" text,
	"last_qpr_filed" text,
	"building_plan" text NOT NULL,
	"permit_no" text,
	"sanctioned_floors" integer,
	"sanctioned_config" text,
	"oc_status" text,
	"lake_buffer" text NOT NULL,
	"survey_numbers" text,
	"site_lat" double precision,
	"site_lng" double precision,
	"nearest_lake_meters" integer,
	"rate_per_sq_ft" integer NOT NULL,
	"price_range" text NOT NULL,
	"config" text NOT NULL,
	"possession_year" text NOT NULL,
	"distance_to_it" text NOT NULL,
	"safety_score" integer NOT NULL,
	"status" text NOT NULL,
	"summary" text NOT NULL,
	"why_summary" text NOT NULL,
	"key_concerns" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_urls" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_verified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_live" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scrape_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trigger" text NOT NULL,
	"mode" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text,
	"source" text NOT NULL,
	"url" text NOT NULL,
	"content_hash" text NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watch_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"channel" text NOT NULL,
	"contact" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_alert_id_project_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."project_alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_updates" ADD CONSTRAINT "pending_updates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_updates" ADD CONSTRAINT "pending_updates_market_name_micro_markets_name_fk" FOREIGN KEY ("market_name") REFERENCES "public"."micro_markets"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_alerts" ADD CONSTRAINT "project_alerts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_subscriptions" ADD CONSTRAINT "watch_subscriptions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pending_updates_status_idx" ON "pending_updates" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "pending_updates_hash_idx" ON "pending_updates" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "project_alerts_project_idx" ON "project_alerts" USING btree ("project_id","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "source_snapshots_url_idx" ON "source_snapshots" USING btree ("source","url");--> statement-breakpoint
CREATE UNIQUE INDEX "watch_project_contact_idx" ON "watch_subscriptions" USING btree ("project_id","contact");