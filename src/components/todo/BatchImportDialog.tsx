import type React from "react";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ParsedGroup {
  name: string;
  items: ParsedItem[];
}

interface ParsedItem {
  text: string;
  done: boolean;
}

interface BatchImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (groups: ParsedGroup[]) => void;
}

function parseMarkdownTodos(text: string): ParsedGroup[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const groups: ParsedGroup[] = [];
  let currentGroup: ParsedGroup | null = null;

  for (const line of lines) {
    // Check if this is a todo item (starts with - [ ] or - [x])
    const todoMatch = line.match(/^-\s*\[([ x])\]\s*(.+)$/i);

    if (todoMatch) {
      // This is a todo item
      const done = todoMatch[1].toLowerCase() === "x";
      const text = todoMatch[2].trim();

      if (!currentGroup) {
        // Create a default group if we don't have one
        currentGroup = { name: "Items", items: [] };
        groups.push(currentGroup);
      }

      currentGroup.items.push({ text, done });
    } else {
      // This is a group name
      currentGroup = { name: line, items: [] };
      groups.push(currentGroup);
    }
  }

  // Filter out empty groups
  return groups.filter((group) => group.items.length > 0);
}

const LLM_PROMPT = `Please format this as a todo list in the following format:

- Group names should be on their own lines (without any prefix)
- Todo items should start with "- [ ]" for unchecked items or "- [x]" for checked items
- IMPORTANT: Every todo item MUST belong to a group. Do not create items without a group.

Example format:

Work Tasks
- [ ] Review pull requests
- [ ] Update documentation
- [x] Fix bug in login

Personal
- [ ] Buy groceries
- [ ] Call dentist

Please convert the following into this format:`;

export function BatchImportDialog({
  open,
  onOpenChange,
  onImport,
}: BatchImportDialogProps) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ParsedGroup[]>([]);
  const [copied, setCopied] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;

    setText(newText);
    setPreview(parseMarkdownTodos(newText));
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(LLM_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setText("");
      setPreview([]);
      onOpenChange(false);
    }
  };

  const totalItems = preview.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Batch Import</DialogTitle>
          <DialogDescription>
            Paste markdown-like text to create multiple groups and items. Use{" "}
            <code className="bg-muted px-1 rounded">- [ ]</code> for unchecked
            items and <code className="bg-muted px-1 rounded">- [x]</code> for
            checked items. Group names should be on their own lines.
          </DialogDescription>
        </DialogHeader>

        <Button
          className="w-full"
          size="sm"
          variant="outline"
          onClick={handleCopyPrompt}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy prompt for LLM
            </>
          )}
        </Button>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="flex-1 min-h-0">
            <Textarea
              autoFocus
              className="h-full min-h-[200px] font-mono text-sm resize-none"
              placeholder={`Example:

Work Tasks
- [ ] Review pull requests
- [ ] Update documentation
- [x] Fix bug in login

Personal
- [ ] Buy groceries
- [ ] Call dentist`}
              value={text}
              onChange={handleTextChange}
            />
          </div>

          {preview.length > 0 && (
            <div className="border rounded-md p-3 bg-muted/50 max-h-[200px] overflow-y-auto">
              <div className="text-sm font-medium mb-2">
                Preview: {preview.length} group{preview.length !== 1 ? "s" : ""}
                , {totalItems} item{totalItems !== 1 ? "s" : ""}
              </div>
              <div className="space-y-2">
                {preview.map((group, i) => (
                  <div key={i} className="text-sm">
                    <div className="font-semibold">{group.name}</div>
                    <ul className="ml-4 mt-1 space-y-0.5">
                      {group.items.map((item, j) => (
                        <li key={j} className="text-muted-foreground">
                          {item.done ? "✓" : "○"} {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={preview.length === 0} onClick={handleImport}>
            Import {preview.length > 0 && `(${totalItems} items)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
