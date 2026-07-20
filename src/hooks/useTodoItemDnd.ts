import type { TodoGroup, TodoItem } from "../types/todo";
import type { Dispatch, SetStateAction } from "react";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { assignPositions, getChangedRows } from "../lib/itemOrdering";

interface UseTodoItemDndParams {
  items: TodoItem[];
  groups: TodoGroup[];
  /** Optimistically applies a new item ordering without persisting (drag preview). */
  previewItemsOrder: Dispatch<SetStateAction<TodoItem[]>>;
  /** Persists the final ordering: sets state then upserts the changed rows. */
  reorderItems: (nextItems: TodoItem[], changed: TodoItem[]) => Promise<void>;
}

/**
 * Encapsulates the drag-and-drop reordering of todo items across groups:
 * sensors, live cross-group preview, and persisting the final order.
 */
export function useTodoItemDnd({
  items,
  groups,
  previewItemsOrder,
  reorderItems,
}: UseTodoItemDndParams) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Latest items, readable synchronously from event handlers.
  const itemsRef = useRef(items);

  itemsRef.current = items;

  // Item state when the drag began — the baseline for diffing what to persist.
  const dragStartItemsRef = useRef<TodoItem[]>([]);

  const groupIds = useMemo(() => new Set(groups.map((g) => g.id)), [groups]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Resolve the container (group id) an id belongs to — a group id maps to
  // itself; an item id maps to its group_id.
  const findContainer = useCallback(
    (id: string): string | undefined => {
      if (groupIds.has(id)) return id;

      return itemsRef.current.find((i) => i.id === id)?.group_id ?? undefined;
    },
    [groupIds],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    dragStartItemsRef.current = itemsRef.current;
    setActiveId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;

      if (!over) return;

      const activeItemId = String(active.id);
      const overId = String(over.id);
      const activeContainer = findContainer(activeItemId);
      const overContainer = findContainer(overId);

      if (
        !activeContainer ||
        !overContainer ||
        activeContainer === overContainer
      ) {
        return;
      }

      // Move the dragged item into the target group so it previews there;
      // final positions are computed on drop.
      previewItemsOrder((prev) => {
        const activeItem = prev.find((i) => i.id === activeItemId);

        if (!activeItem) return prev;

        const without = prev.filter((i) => i.id !== activeItemId);

        let newIndex: number;

        if (groupIds.has(overId)) {
          const containerItems = without.filter(
            (i) => i.group_id === overContainer,
          );
          const last = containerItems[containerItems.length - 1];

          newIndex = last
            ? without.findIndex((i) => i.id === last.id) + 1
            : without.length;
        } else {
          const overIndex = without.findIndex((i) => i.id === overId);

          newIndex = overIndex >= 0 ? overIndex : without.length;
        }

        const movedItem = { ...activeItem, group_id: overContainer };

        return [
          ...without.slice(0, newIndex),
          movedItem,
          ...without.slice(newIndex),
        ];
      });
    },
    [findContainer, groupIds, previewItemsOrder],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);

      if (!over) return;

      const activeItemId = String(active.id);
      const overId = String(over.id);

      let working = itemsRef.current;

      // Same-container reorder onto another item.
      if (activeItemId !== overId && !groupIds.has(overId)) {
        const activeIndex = working.findIndex((i) => i.id === activeItemId);
        const overIndex = working.findIndex((i) => i.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
          working = arrayMove(working, activeIndex, overIndex);
        }
      }

      const positioned = assignPositions(working);
      // Diff against the pre-drag snapshot (the persisted state) so a
      // cross-group move always persists the new group_id, not just position.
      const changed = getChangedRows(dragStartItemsRef.current, positioned);

      reorderItems(positioned, changed).catch((err) => {
        console.error("Failed to reorder items:", err);
      });
    },
    [groupIds, reorderItems],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeItem = activeId
    ? (items.find((i) => i.id === activeId) ?? null)
    : null;

  return {
    activeItem,
    isDragActive: activeItem !== null,
    dndContextProps: {
      sensors,
      collisionDetection: closestCorners,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
      onDragCancel: handleDragCancel,
    },
  };
}
