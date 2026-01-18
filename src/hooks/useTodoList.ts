import type { TodoList, TodoGroup, TodoItem } from "../types/todo";

import { useState, useCallback } from "react";

import { supabase } from "../lib/supabase";
import { generateUUID } from "../lib/utils";

export function useTodoList(listId: string) {
  const [list, setList] = useState<TodoList | null>(null);
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const createList = useCallback(
    async (name: string = "Untitled List"): Promise<string> => {
      const id = generateUUID();
      const { error } = await supabase.from("todo_lists").insert({ id, name });

      if (error) throw error;

      return id;
    },
    [],
  );

  const loadList = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        setError(null);

        const { data: listData, error: listError } = await supabase
          .from("todo_lists")
          .select("*")
          .eq("id", listId)
          .single();

        if (listError) throw listError;
        setList(listData);

        const { data: groupsData, error: groupsError } = await supabase
          .from("todo_groups")
          .select("*")
          .eq("list_id", listId)
          .order("position");

        if (groupsError) throw groupsError;
        setGroups(groupsData);

        const { data: itemsData, error: itemsError } = await supabase
          .from("todo_items")
          .select("*")
          .eq("list_id", listId)
          .order("position");

        if (itemsError) throw itemsError;
        setItems(itemsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load list"));
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [listId],
  );

  const updateListName = useCallback(
    async (name: string) => {
      const { error } = await supabase
        .from("todo_lists")
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", listId);

      if (error) throw error;
      setList((prev) =>
        prev ? { ...prev, name, updated_at: new Date().toISOString() } : null,
      );
    },
    [listId],
  );

  const addGroup = useCallback(
    async (name: string) => {
      const position = groups.length;
      const newGroup: TodoGroup = {
        id: generateUUID(),
        list_id: listId,
        name,
        position,
        created_at: new Date().toISOString(),
      };

      setGroups((prev) => [...prev, newGroup]);

      const { error } = await supabase.from("todo_groups").insert(newGroup);

      if (error) {
        setGroups((prev) => prev.filter((g) => g.id !== newGroup.id));
        throw error;
      }
    },
    [listId, groups.length],
  );

  const updateGroup = useCallback(
    async (groupId: string, updates: Partial<TodoGroup>) => {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, ...updates } : g)),
      );

      const { error } = await supabase
        .from("todo_groups")
        .update(updates)
        .eq("id", groupId);

      if (error) {
        loadList();
        throw error;
      }
    },
    [loadList],
  );

  const deleteGroup = useCallback(
    async (groupId: string) => {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setItems((prev) => prev.filter((i) => i.group_id !== groupId));

      const { error } = await supabase
        .from("todo_groups")
        .delete()
        .eq("id", groupId);

      if (error) {
        loadList();
        throw error;
      }
    },
    [loadList],
  );

  const addItem = useCallback(
    async (groupId: string, text: string) => {
      const groupItems = items.filter((i) => i.group_id === groupId);
      const position = groupItems.length;
      const newItem: TodoItem = {
        id: generateUUID(),
        group_id: groupId,
        list_id: listId,
        text,
        done: false,
        position,
        created_at: new Date().toISOString(),
        completed_at: null,
      };

      setItems((prev) => [...prev, newItem]);

      const { error } = await supabase.from("todo_items").insert(newItem);

      if (error) {
        setItems((prev) => prev.filter((i) => i.id !== newItem.id));
        throw error;
      }
    },
    [items, listId],
  );

  const updateItem = useCallback(
    async (itemId: string, updates: Partial<TodoItem>) => {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
      );

      const { error } = await supabase
        .from("todo_items")
        .update(updates)
        .eq("id", itemId);

      if (error) {
        loadList();
        throw error;
      }
    },
    [loadList],
  );

  const toggleItem = useCallback(
    async (itemId: string) => {
      const item = items.find((i) => i.id === itemId);

      if (!item) return;

      const newDone = !item.done;
      const updates = {
        done: newDone,
        completed_at: newDone ? new Date().toISOString() : null,
      };

      await updateItem(itemId, updates);
    },
    [items, updateItem],
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      setItems((prev) => prev.filter((i) => i.id !== itemId));

      const { error } = await supabase
        .from("todo_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        loadList();
        throw error;
      }
    },
    [loadList],
  );

  return {
    list,
    groups,
    items,
    loading,
    error,
    createList,
    loadList,
    updateListName,
    addGroup,
    updateGroup,
    deleteGroup,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
  };
}
