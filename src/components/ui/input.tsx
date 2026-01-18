import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        // Base layout and sizing
        "h-9 w-full min-w-0 rounded-md border px-3 py-1",
        "text-base md:text-sm",

        // Visual styling
        "bg-transparent border-input shadow-xs",
        "dark:bg-input/30",

        // Text and selection
        "placeholder:text-muted-foreground",
        "selection:bg-primary selection:text-primary-foreground",

        // Transitions and focus
        "transition-[color,box-shadow] outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-focus",

        // Invalid state
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        "dark:aria-invalid:ring-destructive/40",

        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

        // File input specific
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent",
        "file:text-sm file:font-medium file:text-foreground",

        className,
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

export { Input };
