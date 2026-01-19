-- Enable Row Level Security on keep_alive_logs
ALTER TABLE "public"."keep_alive_logs" ENABLE ROW LEVEL SECURITY;

-- Create public access policy (matching other tables)
CREATE POLICY "Public access" ON "public"."keep_alive_logs" USING (true);
