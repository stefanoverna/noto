import type { TodoGroup, TodoItem } from "../types/todo";

// Shared plain-text format for todo lists, used by both batch import (parse)
// and export (serialize) so the two round-trip losslessly:
//
//   # Group name
//   - [ ] Open item
//   > Optional description, blockquote-style
//   > second line, bare ">" below = paragraph break
//   >
//   > second paragraph
//   - [x] Done item

export interface ParsedItem {
  text: string;
  done: boolean;
  description: string;
}

export interface ParsedGroup {
  name: string;
  items: ParsedItem[];
}

export function parseTodoText(text: string): ParsedGroup[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const groups: ParsedGroup[] = [];
  let currentGroup: ParsedGroup | null = null;
  let currentItem: ParsedItem | null = null;
  // Description lines collected for the current item; joined at flush time so a
  // bare ">" line becomes a blank line (paragraph break) in the description.
  let descriptionLines: string[] = [];

  const flushDescription = () => {
    if (currentItem && descriptionLines.length > 0) {
      currentItem.description = descriptionLines.join("\n").trim();
    }
    descriptionLines = [];
  };

  for (const line of lines) {
    const todoMatch = line.match(/^-\s*\[([ x])\]\s*(.+)$/i);
    // Description lines are blockquote-style: "> some text" attached to the
    // item above. Robust to trimming, unlike leading indentation.
    const descriptionMatch = line.match(/^>\s?(.*)$/);
    // Group titles are ATX headings ("# Name"). Any heading level is accepted.
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);

    if (descriptionMatch) {
      // Attach to the current item; ignore an orphan ">" with no item above it.
      if (currentItem) {
        descriptionLines.push(descriptionMatch[1]);
      }
      continue;
    }

    // Any other line ends the previous item's description.
    flushDescription();

    if (todoMatch) {
      const done = todoMatch[1].toLowerCase() === "x";
      const itemText = todoMatch[2].trim();

      if (!currentGroup) {
        // Create a default group if we don't have one
        currentGroup = { name: "Items", items: [] };
        groups.push(currentGroup);
      }

      currentItem = { text: itemText, done, description: "" };
      currentGroup.items.push(currentItem);
    } else {
      // Group title. Canonical form is an ATX heading ("# Name"); a bare line
      // is still accepted for backward compatibility with older exports.
      currentGroup = {
        name: headingMatch ? headingMatch[1].trim() : line,
        items: [],
      };
      currentItem = null;
      groups.push(currentGroup);
    }
  }

  flushDescription();

  // Filter out empty groups
  return groups.filter((group) => group.items.length > 0);
}

export function serializeTodos(groups: TodoGroup[], items: TodoItem[]): string {
  const blocks = groups.map((group) => {
    const lines: string[] = [`# ${group.name}`];

    for (const item of items.filter((i) => i.group_id === group.id)) {
      lines.push(`- [${item.done ? "x" : " "}] ${item.text}`);

      if (item.description) {
        // One ">" line per description line; empty lines become a bare ">"
        // so paragraph breaks survive the round-trip through parseTodoText.
        for (const descriptionLine of item.description.split("\n")) {
          lines.push(descriptionLine ? `> ${descriptionLine}` : ">");
        }
      }
    }

    return lines.join("\n");
  });

  return blocks.join("\n\n");
}
