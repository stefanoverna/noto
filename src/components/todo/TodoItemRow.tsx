import type { CSSProperties, ReactNode } from "react";

import { forwardRef } from "react";

import { ItemDescription } from "./ItemDescription";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TodoItemRowProps {
  text: string;
  done: boolean;
  /**
   * Inline-markdown description shown under the title (empty string = none).
   * Rendered outside the toggle button so its links stay clickable (an `<a>`
   * cannot live inside a `<button>`).
   */
  description?: string;
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
    {
      text,
      done,
      description,
      gripSlot,
      trailingSlot,
      onToggle,
      className,
      style,
    },
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
        className={cn("rounded-md transition-colors", className)}
        style={style}
      >
        <div className="flex items-center gap-2">
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

        {description ? (
          // Spacers mirror the grip + checkbox columns above so the
          // description aligns under the title, not under the checkbox.
          <div className="flex gap-2 pb-1.5">
            <div className="w-6 shrink-0" />
            <div className="flex gap-4 flex-1 min-w-0">
              <div className="w-5 shrink-0" />
              <ItemDescription className="flex-1 min-w-0" text={description} />
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);
