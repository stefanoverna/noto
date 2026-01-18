// Re-export the generated database types
export type { Database } from "./database.types";
import type { Database } from "./database.types";

// Export convenient type aliases for the table rows
export type TodoList = Database["public"]["Tables"]["todo_lists"]["Row"];
export type TodoGroup = Database["public"]["Tables"]["todo_groups"]["Row"];
export type TodoItem = Database["public"]["Tables"]["todo_items"]["Row"];
