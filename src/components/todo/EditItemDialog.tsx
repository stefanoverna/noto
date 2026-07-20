import type React from "react";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (value: { text: string; description: string }) => void;
  initialText?: string;
  initialDescription?: string;
}

export function EditItemDialog({
  open,
  onOpenChange,
  onSave,
  initialText = "",
  initialDescription = "",
}: EditItemDialogProps) {
  const [text, setText] = useState(initialText);
  const [description, setDescription] = useState(initialDescription);

  // Reset local state each time the dialog opens with fresh values.
  useEffect(() => {
    if (open) {
      setText(initialText);
      setDescription(initialDescription);
    }
  }, [open, initialText, initialDescription]);

  const handleSave = () => {
    const trimmedText = text.trim();

    if (!trimmedText) return;

    onSave({
      text: trimmedText,
      description: description.trim(),
    });
    onOpenChange(false);
  };

  // Enter saves from the single-line title; the description textarea keeps
  // Enter for newlines (submit via the Save button or Cmd/Ctrl+Enter).
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-item-text">Title</Label>
            <Input
              autoFocus
              className="text-lg h-12"
              id="edit-item-text"
              placeholder="Enter item text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleTitleKeyDown}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-item-description">Description</Label>
            <Textarea
              id="edit-item-description"
              placeholder="Add a description… supports **bold**, *italic*, `code`, [links](https://example.com)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleDescriptionKeyDown}
            />
            <p className="text-xs text-muted-foreground">
              Inline markdown only — leave empty to remove.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!text.trim()} onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
