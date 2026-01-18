import type { TodoGroup as TodoGroupType } from "../types/todo";

import { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useTodoList } from "../hooks/useTodoList";
import { useTodoSync } from "../hooks/useTodoSync";
import { TopNavbar } from "../components/todo/TopNavbar";
import { TodoGroup } from "../components/todo/TodoGroup";
import { ShareDialog } from "../components/todo/ShareDialog";
import { CreateGroupDialog } from "../components/todo/CreateGroupDialog";
import { isValidUUID } from "../lib/utils";

import { TooltipProvider } from "@/components/ui/tooltip";

export default function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

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

  const handleGroupChange = useCallback(() => {
    loadList(true); // silent reload without loading state
  }, [loadList]);

  const handleItemChange = useCallback(() => {
    loadList(true); // silent reload without loading state
  }, [loadList]);

  const { connected } = useTodoSync({
    listId: listId || "",
    onGroupChange: handleGroupChange,
    onItemChange: handleItemChange,
  });

  const handleAddGroup = useCallback(
    async (name: string) => {
      try {
        await addGroup(name);
      } catch (error) {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.error("Failed to update list name:", error);
      }
    },
    [updateListName],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
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
          onShareClick={() => setShareOpen(true)}
          onTitleChange={handleUpdateListName}
        />

        <div className="max-w-2xl mx-auto px-4 pt-4 md:pt-8 pb-8">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold mb-2">No groups yet</h2>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first group
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <TodoGroup
                  key={group.id}
                  group={group}
                  items={items.filter((item) => item.group_id === group.id)}
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
      </div>
    </TooltipProvider>
  );
}
