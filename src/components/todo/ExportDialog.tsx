import type { TodoGroup, TodoItem } from "../../types/todo";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";

import { serializeTodos } from "@/lib/todoTextFormat";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: TodoGroup[];
  items: TodoItem[];
}

export function ExportDialog({
  open,
  onOpenChange,
  groups,
  items,
}: ExportDialogProps) {
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => serializeTodos(groups, items), [groups, items]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy export:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export as text</DialogTitle>
          <DialogDescription>
            Copy this text to edit elsewhere (e.g. with an LLM), then paste it
            back via <span className="font-medium">Import from text</span>. The
            format round-trips, including{" "}
            <code className="bg-muted px-1 rounded">&gt;</code> descriptions.
          </DialogDescription>
        </DialogHeader>

        <Button
          className="w-full"
          size="sm"
          variant="outline"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy to clipboard
            </>
          )}
        </Button>

        <div className="flex-1 min-h-0">
          <Textarea
            readOnly
            className="h-full min-h-[240px] font-mono text-sm resize-none"
            value={text}
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>

        <div className="flex items-center justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
