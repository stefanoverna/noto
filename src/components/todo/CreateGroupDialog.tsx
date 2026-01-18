import { EditTextDialog } from "./EditTextDialog";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (name: string) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onCreateGroup,
}: CreateGroupDialogProps) {
  return (
    <EditTextDialog
      open={open}
      placeholder="Enter group name..."
      submitLabel="Create"
      title="Create New Group"
      onOpenChange={onOpenChange}
      onSave={onCreateGroup}
    />
  );
}
