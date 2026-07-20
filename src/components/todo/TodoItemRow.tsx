import type { CSSProperties, ReactNode } from "react";

import { forwardRef } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TodoItemRowProps {
  text: string;
  done: boolean;
  /** Drag handle element (interactive in the list, static in the drag overlay). */
  gripSlot?: ReactNode;
  /** Trailing element, e.g. the actions menu. */
  trailingSlot?: ReactNode;
  /** When provided, the checkbox + text become a clickable toggle button. */
  onToggle?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Presentational todo row shared by the interactive `TodoItem` (wrapped in
 * `useSortable`) and the `DragOverlay` preview, so both stay visually in sync.
 */
export const TodoItemRow = forwardRef<HTMLDivElement, TodoItemRowProps>(
  function TodoItemRow(
    { text, done, gripSlot, trailingSlot, onToggle, className, style },
    ref,
  ) {
    const content = (
      <>
        <Checkbox
          checked={done}
          className="h-5 w-5 rounded-full data-[state=checked]:bg-success data-[state=checked]:border-success pointer-events-none"
        />
        <span
          className={cn(
            "flex-1 py-1.5 text-base transition-all leading-tight",
            done && "line-through text-muted-foreground",
          )}
        >
          {text}
        </span>
      </>
    );

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 rounded-md transition-colors",
          className,
        )}
        style={style}
      >
        {gripSlot}

        {onToggle ? (
          <button
            className="flex items-center gap-4 flex-1 min-w-0 text-left"
            type="button"
            onClick={onToggle}
          >
            {content}
          </button>
        ) : (
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {content}
          </div>
        )}

        {trailingSlot}
      </div>
    );
  },
);
