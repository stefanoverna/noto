export interface TodoList {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TodoGroup {
  id: string;
  list_id: string;
  name: string;
  position: number;
  collapsed: boolean;
  created_at: string;
}

export interface TodoItem {
  id: string;
  group_id: string;
  text: string;
  done: boolean;
  position: number;
  created_at: string;
  completed_at: string | null;
}

export type Database = {
  public: {
    Tables: {
      todo_lists: {
        Row: TodoList;
        Insert: Omit<TodoList, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<TodoList, 'id' | 'created_at'>>;
      };
      todo_groups: {
        Row: TodoGroup;
        Insert: Omit<TodoGroup, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<TodoGroup, 'id' | 'created_at'>>;
      };
      todo_items: {
        Row: TodoItem;
        Insert: Omit<TodoItem, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<TodoItem, 'id' | 'created_at'>>;
      };
    };
  };
};
