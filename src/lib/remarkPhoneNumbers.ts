import type { Link, PhrasingContent, Root, Text } from "mdast";

import { findPhoneNumbersInText } from "libphonenumber-js";
import { SKIP, visit } from "unist-util-visit";

/**
 * Remark plugin: find phone numbers written in international format
 * (e.g. `+1 415 555 2671`) in plain text and turn them into `tel:` links.
 *
 * Only international (`+`-prefixed) numbers are matched. National-format
 * numbers are ambiguous with dates, ids, quantities, etc. and would produce
 * false positives, so they're left alone — pass a default country to
 * `findPhoneNumbersInText` if national numbers should be linked too.
 *
 * Runs after `remark-gfm`, and skips text already inside a link, so it never
 * double-links a URL/email autolink or an explicit `[label](url)`.
 */
export function remarkPhoneNumbers() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (parent == null || index == null || parent.type === "link") {
        return;
      }

      const matches = findPhoneNumbersInText(node.value);

      if (matches.length === 0) {
        return;
      }

      const replacement: PhrasingContent[] = [];
      let cursor = 0;

      for (const match of matches) {
        if (match.startsAt > cursor) {
          replacement.push({
            type: "text",
            value: node.value.slice(cursor, match.startsAt),
          });
        }

        // Link to the canonical E.164 number, but display it nicely
        // formatted (e.g. `+1 415 555 2671`) regardless of how it was typed.
        const link: Link = {
          type: "link",
          url: `tel:${match.number.number}`,
          children: [
            { type: "text", value: match.number.formatInternational() },
          ],
        };

        replacement.push(link);
        cursor = match.endsAt;
      }

      if (cursor < node.value.length) {
        replacement.push({ type: "text", value: node.value.slice(cursor) });
      }

      parent.children.splice(index, 1, ...replacement);

      // Resume after the nodes we just inserted so we don't re-visit them.
      return [SKIP, index + replacement.length];
    });
  };
}
