import type { RealtimeChannel } from "@supabase/supabase-js";
import type { TodoList, TodoGroup, TodoItem } from "../types/todo";

import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

type ChangeHandler<T> = (payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
}) => void;

interface UseTodoSyncOptions {
  listId: string;
  onListChange?: ChangeHandler<TodoList>;
  onGroupChange?: ChangeHandler<TodoGroup>;
  onItemChange?: ChangeHandler<TodoItem>;
}

export function useTodoSync({
  listId,
  onListChange,
  onGroupChange,
  onItemChange,
}: UseTodoSyncOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const realtimeChannel = supabase.channel(`list:${listId}`);

    // Listen to postgres_changes for todo_lists
    if (onListChange) {
      realtimeChannel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todo_lists",
          filter: `id=eq.${listId}`,
        },
        (payload) => {
          onListChange({
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: payload.new as TodoList,
            old: payload.old as TodoList,
          });
        },
      );
    }

    // Listen to postgres_changes for todo_groups
    if (onGroupChange) {
      realtimeChannel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todo_groups",
          filter: `list_id=eq.${listId}`,
        },
        (payload) => {
          onGroupChange({
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: payload.new as TodoGroup,
            old: payload.old as TodoGroup,
          });
        },
      );
    }

    // Listen to postgres_changes for todo_items
    // Note: We can't filter by list_id directly, so we'll need to check in the handler
    if (onItemChange) {
      realtimeChannel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todo_items",
        },
        (payload) => {
          onItemChange({
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: payload.new as TodoItem,
            old: payload.old as TodoItem,
          });
        },
      );
    }

    realtimeChannel.subscribe((status) => {
      setConnected(status === "SUBSCRIBED");
    });

    setChannel(realtimeChannel);

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [listId, onListChange, onGroupChange, onItemChange]);

  return { connected, channel };
}
