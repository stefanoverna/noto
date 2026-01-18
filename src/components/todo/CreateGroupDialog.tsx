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
      onOpenChange={onOpenChange}
      onSave={onCreateGroup}
      title="Create New Group"
      placeholder="Enter group name..."
      submitLabel="Create"
    />
  );
}
