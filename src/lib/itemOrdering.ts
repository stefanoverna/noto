import type { TodoItem } from "../types/todo";

/**
 * Assigns a contiguous 0-based `position` within each group, preserving the
 * array order. Items keep their identity (same object reference) when their
 * position is already correct, so React can skip unaffected rows.
 */
export function assignPositions(items: TodoItem[]): TodoItem[] {
  const counters: Record<string, number> = {};

  return items.map((item) => {
    const pos = counters[item.group_id] ?? 0;

    counters[item.group_id] = pos + 1;

    return item.position === pos ? item : { ...item, position: pos };
  });
}

/**
 * Returns the rows whose `group_id` or `position` differs from the baseline —
 * i.e. the minimal set that needs persisting after a reorder. Rows absent from
 * the baseline are ignored (nothing to diff against).
 */
export function getChangedRows(
  baseline: TodoItem[],
  next: TodoItem[],
): TodoItem[] {
  const byId = new Map(baseline.map((item) => [item.id, item]));

  return next.filter((item) => {
    const old = byId.get(item.id);

    return (
      old !== undefined &&
      (old.position !== item.position || old.group_id !== item.group_id)
    );
  });
}
