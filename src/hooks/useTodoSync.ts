import { useEffect, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { TodoList, TodoGroup, TodoItem } from '../types/todo';
import { supabase } from '../lib/supabase';

type ChangeHandler<T> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
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

    realtimeChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'todo_lists',
        filter: `id=eq.${listId}`,
      },
      (payload) => {
        onListChange?.(payload as any);
      }
    );

    realtimeChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'todo_groups',
        filter: `list_id=eq.${listId}`,
      },
      (payload) => {
        onGroupChange?.(payload as any);
      }
    );

    realtimeChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'todo_items',
      },
      (payload) => {
        onItemChange?.(payload as any);
      }
    );

    realtimeChannel.subscribe((status) => {
      setConnected(status === 'SUBSCRIBED');
    });

    setChannel(realtimeChannel);

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [listId, onListChange, onGroupChange, onItemChange]);

  return { connected, channel };
}
