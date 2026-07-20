update "public"."todo_items" set "description" = '' where "description" is null;
alter table "public"."todo_items" alter column "description" set default '';
alter table "public"."todo_items" alter column "description" set not null;
