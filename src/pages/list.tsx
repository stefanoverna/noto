import type { TodoGroup as TodoGroupType } from "../types/todo";

import { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, FileText, Layers } from "lucide-react";

import { useTodoList } from "../hooks/useTodoList";
import { useTodoSync } from "../hooks/useTodoSync";
import { TopNavbar } from "../components/todo/TopNavbar";
import { TodoGroup } from "../components/todo/TodoGroup";
import { ShareDialog } from "../components/todo/ShareDialog";
import { CreateGroupDialog } from "../components/todo/CreateGroupDialog";
import { BatchImportDialog } from "../components/todo/BatchImportDialog";
import { isValidUUID, generateUUID } from "../lib/utils";
import { supabase } from "../lib/supabase";

import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [batchImportOpen, setBatchImportOpen] = useState(false);

  const {
    list,
    groups,
    items,
    loading,
    error,
    loadList,
    updateListName,
    addGroup,
    updateGroup,
    deleteGroup,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
  } = useTodoList(listId || "");

  useEffect(() => {
    if (!listId || !isValidUUID(listId)) {
      navigate("/");

      return;
    }
    loadList();
  }, [listId, navigate, loadList]);

  const handleListChange = useCallback(() => {
    loadList(true); // silent reload without loading state
  }, [loadList]);

  const handleGroupChange = useCallback(() => {
    loadList(true); // silent reload without loading state
  }, [loadList]);

  const handleItemChange = useCallback(() => {
    loadList(true); // silent reload without loading state
  }, [loadList]);

  const { connected } = useTodoSync({
    listId: listId || "",
    onListChange: handleListChange,
    onGroupChange: handleGroupChange,
    onItemChange: handleItemChange,
  });

  const handleAddGroup = useCallback(
    async (name: string) => {
      try {
        await addGroup(name);
      } catch (error) {
        console.error("Failed to add group:", error);
      }
    },
    [addGroup],
  );

  const handleUpdateGroup = useCallback(
    async (groupId: string, updates: Partial<TodoGroupType>) => {
      try {
        await updateGroup(groupId, updates);
      } catch (error) {
        console.error("Failed to update group:", error);
      }
    },
    [updateGroup],
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      try {
        await deleteGroup(groupId);
      } catch (error) {
        console.error("Failed to delete group:", error);
      }
    },
    [deleteGroup],
  );

  const handleAddItem = useCallback(
    async (groupId: string, text: string) => {
      try {
        await addItem(groupId, text);
      } catch (error) {
        console.error("Failed to add item:", error);
      }
    },
    [addItem],
  );

  const handleUpdateItem = useCallback(
    async (itemId: string, text: string) => {
      try {
        await updateItem(itemId, { text });
      } catch (error) {
        console.error("Failed to update item:", error);
      }
    },
    [updateItem],
  );

  const handleToggleItem = useCallback(
    async (itemId: string) => {
      try {
        await toggleItem(itemId);
      } catch (error) {
        console.error("Failed to toggle item:", error);
      }
    },
    [toggleItem],
  );

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      try {
        await deleteItem(itemId);
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    },
    [deleteItem],
  );

  const handleUpdateListName = useCallback(
    async (name: string) => {
      try {
        await updateListName(name);
      } catch (error) {
        console.error("Failed to update list name:", error);
      }
    },
    [updateListName],
  );

  const handleBatchImport = useCallback(
    async (
      parsedGroups: Array<{
        name: string;
        items: Array<{ text: string; done: boolean }>;
      }>,
    ) => {
      if (!listId) return;

      try {
        const now = new Date().toISOString();
        const groupsToInsert = [];
        const itemsToInsert = [];

        let groupPosition = groups.length;

        for (const parsedGroup of parsedGroups) {
          const groupId = generateUUID();

          groupsToInsert.push({
            id: groupId,
            list_id: listId,
            name: parsedGroup.name,
            position: groupPosition++,
            created_at: now,
          });

          let itemPosition = 0;

          for (const item of parsedGroup.items) {
            itemsToInsert.push({
              id: generateUUID(),
              group_id: groupId,
              list_id: listId,
              text: item.text,
              done: item.done,
              position: itemPosition++,
              created_at: now,
              completed_at: item.done ? now : null,
            });
          }
        }

        if (groupsToInsert.length > 0) {
          const { error: groupsError } = await supabase
            .from("todo_groups")
            .insert(groupsToInsert);

          if (groupsError) throw groupsError;
        }

        if (itemsToInsert.length > 0) {
          const { error: itemsError } = await supabase
            .from("todo_items")
            .insert(itemsToInsert);

          if (itemsError) throw itemsError;
        }

        await loadList();
      } catch (error) {
        console.error("Failed to batch import:", error);
      }
    },
    [listId, groups.length, loadList],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-2">List not found</h2>
        <p className="text-muted-foreground">
          This todo list doesn&apos;t exist or has been deleted.
        </p>
      </div>
    );
  }

  const completedCount = items.filter((item) => item.done).length;

  return (
    <TooltipProvider>
      <div className="min-h-svh">
        <TopNavbar
          completedCount={completedCount}
          status={connected ? "connected" : "connecting"}
          title={list.name}
          totalCount={items.length}
          onAddGroup={() => setCreateGroupOpen(true)}
          onBatchImportClick={() => setBatchImportOpen(true)}
          onShareClick={() => setShareOpen(true)}
          onTitleChange={handleUpdateListName}
        />

        <div className="max-w-2xl mx-auto px-4 pt-4 md:pt-8 pb-8">
          {groups.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Layers className="w-16 h-16" />
                </EmptyMedia>
                <EmptyTitle>No groups yet</EmptyTitle>
                <EmptyDescription>
                  Get started by creating your first group or import tasks from
                  text
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={() => setCreateGroupOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create group
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setBatchImportOpen(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Import from text
                  </Button>
                </div>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <TodoGroup
                  key={group.id}
                  group={group}
                  items={items
                    .filter((item) => item.group_id === group.id)
                    .sort((a, b) => {
                      // Completed items first, then uncompleted items
                      if (a.done === b.done) return 0;

                      return a.done ? -1 : 1;
                    })}
                  onAddItem={handleAddItem}
                  onDeleteGroup={handleDeleteGroup}
                  onDeleteItem={handleDeleteItem}
                  onToggleItem={handleToggleItem}
                  onUpdateGroup={handleUpdateGroup}
                  onUpdateItem={handleUpdateItem}
                />
              ))}
            </div>
          )}
        </div>

        <ShareDialog
          isOpen={shareOpen}
          listId={listId || ""}
          onClose={() => setShareOpen(false)}
        />
        <CreateGroupDialog
          open={createGroupOpen}
          onCreateGroup={handleAddGroup}
          onOpenChange={setCreateGroupOpen}
        />
        <BatchImportDialog
          open={batchImportOpen}
          onImport={handleBatchImport}
          onOpenChange={setBatchImportOpen}
        />
      </div>
    </TooltipProvider>
  );
}
