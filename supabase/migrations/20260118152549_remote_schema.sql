


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."todo_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "list_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "collapsed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."todo_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."todo_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "text" "text" NOT NULL,
    "done" boolean DEFAULT false,
    "position" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."todo_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."todo_lists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" DEFAULT 'Untitled List'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."todo_lists" OWNER TO "postgres";


ALTER TABLE ONLY "public"."todo_groups"
    ADD CONSTRAINT "todo_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."todo_items"
    ADD CONSTRAINT "todo_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."todo_lists"
    ADD CONSTRAINT "todo_lists_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_groups_list" ON "public"."todo_groups" USING "btree" ("list_id");



CREATE INDEX "idx_items_group" ON "public"."todo_items" USING "btree" ("group_id");



ALTER TABLE ONLY "public"."todo_groups"
    ADD CONSTRAINT "todo_groups_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."todo_lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."todo_items"
    ADD CONSTRAINT "todo_items_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."todo_groups"("id") ON DELETE CASCADE;



CREATE POLICY "Public access" ON "public"."todo_groups" USING (true);



CREATE POLICY "Public access" ON "public"."todo_items" USING (true);



CREATE POLICY "Public access" ON "public"."todo_lists" USING (true);



ALTER TABLE "public"."todo_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."todo_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."todo_lists" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."todo_groups";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."todo_items";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."todo_lists";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."todo_groups" TO "anon";
GRANT ALL ON TABLE "public"."todo_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."todo_groups" TO "service_role";



GRANT ALL ON TABLE "public"."todo_items" TO "anon";
GRANT ALL ON TABLE "public"."todo_items" TO "authenticated";
GRANT ALL ON TABLE "public"."todo_items" TO "service_role";



GRANT ALL ON TABLE "public"."todo_lists" TO "anon";
GRANT ALL ON TABLE "public"."todo_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."todo_lists" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































