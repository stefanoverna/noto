import type React from "react";
import type { ParsedGroup } from "@/lib/todoTextFormat";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

import { ItemDescription } from "./ItemDescription";

import { parseTodoText } from "@/lib/todoTextFormat";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface BatchImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (groups: ParsedGroup[], replace: boolean) => void;
  hasExisting: boolean;
}

const LLM_PROMPT = `Please format this as a todo list in the following format:

- Group titles should be markdown headings, e.g. "# Work Tasks"
- Todo items should start with "- [ ]" for unchecked items or "- [x]" for checked items
- IMPORTANT: Every todo item MUST belong to a group. Do not create items without a group.
- OPTIONAL: An item can have a description on the following line(s), each prefixed with "> ". Descriptions may use inline markdown (**bold**, *italic*, \`code\`, [links](url)). Use consecutive "> " lines for multiple lines, and a bare ">" line to separate paragraphs.

Example format:

# Work Tasks
- [ ] Review pull requests
> Focus on the **auth** module and check the token refresh path
- [ ] Update documentation
- [x] Fix bug in login

# Personal
- [ ] Buy groceries
> Milk, eggs, bread
- [ ] Call dentist

Please convert the following into this format:`;

export function BatchImportDialog({
  open,
  onOpenChange,
  onImport,
  hasExisting,
}: BatchImportDialogProps) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ParsedGroup[]>([]);
  const [copied, setCopied] = useState(false);
  const [replace, setReplace] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;

    setText(newText);
    setPreview(parseTodoText(newText));
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
      onImport(preview, replace && hasExisting);
      setText("");
      setPreview([]);
      setReplace(false);
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
            Paste markdown-like text to create multiple groups and items. Start
            group titles with <code className="bg-muted px-1 rounded">#</code>,
            and use <code className="bg-muted px-1 rounded">- [ ]</code> for
            unchecked items and{" "}
            <code className="bg-muted px-1 rounded">- [x]</code> for checked
            items. Add an optional description on the next line(s) with{" "}
            <code className="bg-muted px-1 rounded">&gt;</code>.
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

# Work Tasks
- [ ] Review pull requests
> Focus on the auth module
- [ ] Update documentation
- [x] Fix bug in login

# Personal
- [ ] Buy groceries
> Milk, eggs, bread`}
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
                          <span>
                            {item.done ? "✓" : "○"} {item.text}
                          </span>
                          {item.description && (
                            <ItemDescription
                              className="ml-4"
                              text={item.description}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {replace && hasExisting && (
          <p className="text-sm text-destructive">
            This deletes all current groups and items before importing.
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          {hasExisting ? (
            <label
              className="flex items-center gap-2 text-sm cursor-pointer select-none"
              htmlFor="batch-import-replace"
            >
              <Checkbox
                checked={replace}
                id="batch-import-replace"
                onCheckedChange={(v) => setReplace(v === true)}
              />
              Replace current list
            </label>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={preview.length === 0}
              variant={replace && hasExisting ? "destructive" : "default"}
              onClick={handleImport}
            >
              {replace && hasExisting ? "Replace" : "Import"}
              {preview.length > 0 && ` (${totalItems} items)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
