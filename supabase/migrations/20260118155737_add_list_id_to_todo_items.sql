-- Add list_id column to todo_items table to enable direct filtering by list
-- This improves realtime subscription performance by avoiding joins

-- Step 1: Add the column as nullable first
ALTER TABLE "public"."todo_items"
ADD COLUMN "list_id" "uuid";

-- Step 2: Populate list_id for existing records by joining through todo_groups
UPDATE "public"."todo_items"
SET "list_id" = "todo_groups"."list_id"
FROM "public"."todo_groups"
WHERE "todo_items"."group_id" = "todo_groups"."id";

-- Step 3: Make the column NOT NULL now that it's populated
ALTER TABLE "public"."todo_items"
ALTER COLUMN "list_id" SET NOT NULL;

-- Step 4: Add foreign key constraint to maintain referential integrity
ALTER TABLE "public"."todo_items"
ADD CONSTRAINT "todo_items_list_id_fkey"
FOREIGN KEY ("list_id")
REFERENCES "public"."todo_lists"("id")
ON DELETE CASCADE;

-- Step 5: Create index for better query performance
CREATE INDEX "idx_items_list" ON "public"."todo_items" USING "btree" ("list_id");

-- Step 6: Add composite unique constraint on todo_groups to enable composite foreign key
-- This allows us to reference (id, list_id) together
ALTER TABLE "public"."todo_groups"
ADD CONSTRAINT "todo_groups_id_list_id_key" UNIQUE ("id", "list_id");

-- Step 7: Add composite foreign key to ensure group_id and list_id are coherent
-- This ensures that the group_id belongs to the specified list_id
ALTER TABLE "public"."todo_items"
ADD CONSTRAINT "todo_items_group_id_list_id_fkey"
FOREIGN KEY ("group_id", "list_id")
REFERENCES "public"."todo_groups"("id", "list_id")
ON DELETE CASCADE;
