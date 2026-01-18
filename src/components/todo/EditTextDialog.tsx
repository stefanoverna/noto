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

interface EditTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (value: string) => void;
  title: string;
  placeholder?: string;
  initialValue?: string;
  submitLabel?: string;
}

export function EditTextDialog({
  open,
  onOpenChange,
  onSave,
  title,
  placeholder = "Enter text...",
  initialValue = "",
  submitLabel = "Save",
}: EditTextDialogProps) {
  const [value, setValue] = useState(initialValue);

  // Update local state when dialog opens with new initial value
  useEffect(() => {
    if (open) {
      setValue(initialValue);
    }
  }, [open, initialValue]);

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim());
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <Input
            autoFocus
            className="text-lg h-12"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!value.trim()} onClick={handleSave}>
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
