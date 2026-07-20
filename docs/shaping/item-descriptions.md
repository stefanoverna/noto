---
shaping: true
---

# Todo Item Descriptions — Shaping

## Source

> I want to add description details to the TODO items. A simplified one-line
> markdown (just basic formatting, bold/italic/code/links) would be great.
> It should be shown smaller than the title.

---

## Requirements (R)

| ID | Requirement | Status |
|----|-------------|--------|
| R0 | Each todo item can carry an optional description alongside its title | Core goal |
| R1 | Description supports inline markdown — **bold**, *italic*, `code`, and links — rendered formatted, not as raw source | Must-have |
| R2 | Description is visually secondary: smaller and/or muted relative to the title | Must-have |
| R3 | Items with no description look exactly as today — no empty space, no layout shift | Must-have |
| R4 | Users can add / edit / clear a description through the existing edit affordance | Must-have |
| R5 | 🟡 Display supports **multiple paragraphs and line breaks** (blank line = new paragraph, single newline = `<br>` via `remark-breaks`); still no headings/lists. Nothing truncated. Tight line height (`leading-tight`) | Decided (revised from "one-line") |
| R6 | 🟡 Links are **clickable, open in a new tab** (`rel="noopener noreferrer"`); scheme allowlist `http`/`https`/`mailto`, unsafe schemes dropped | Decided |
| R7 | 🟡 When an item is done, the description stays normal — **only the title** gets completed styling | Decided |
| R8 | 🟡 A markdown **library is accepted** here — robust parsing/sanitization is worth the dependency | Decided (traded off) |
| R9 | 🟡 Bare URLs and emails autolink; an autolinked **URL renders as just its domain** (`google.com`), while explicit `[label](url)` keeps its label. Emails render in full | Decided |
| R10 | 🟡 International (`+`-prefixed) phone numbers autolink as `tel:` links and **render formatted** (`+1 415 555 2671`); national/ambiguous numbers are left alone to avoid false positives | Decided |

---

## S: Add a `description` field with an inline-markdown renderer

Shared spine (same regardless of the contested choices below):

| Part | Mechanism | Flag |
|------|-----------|:----:|
| **S1** | **Storage** — migration adding nullable `description text` to `todo_items`; regenerate `database.types.ts` | |
| **S2** | **Render** — component that turns the stored string into formatted inline React nodes (see C-Render) | |
| **S3** | **Edit** — extend the edit flow so a description can be set/changed/cleared (see C-Edit) | |
| **S4** | **Display** — render below the title in `TodoItem`, smaller/muted, hidden when empty (see C-Display) | |

---

## C-Render: How markdown becomes formatted text

| | Approach |
|---|----------|
| **C-Render-A** | **Hand-rolled inline parser** — a small function that handles only `**bold**`, `*italic*`, `` `code` ``, and `[text](url)`, emitting React elements. URL scheme allowlist baked in. Zero dependencies. |
| **C-Render-B** | **Library** — pull in `react-markdown` (or `marked` + sanitizer), configured to allow only inline nodes. More robust parsing, but a new dependency and config surface. |

| Req | Requirement | Status | C-Render-A | C-Render-B |
|-----|-------------|--------|:----------:|:----------:|
| R1 | Inline markdown rendered formatted | Must-have | ✅ | ✅ |
| R6 | Links are safe | Undecided | ✅ | ✅ |
| R8 | No heavy new dependency | Leaning yes | ✅ | ❌ |

**Notes:**
- C-Render-B fails R8: `react-markdown` + remark pulls a non-trivial dependency tree for a deliberately tiny feature.
- Given the format is intentionally a "simplified one-line" subset, C-Render-A is the natural fit — the whole grammar is 4 rules.

---

## C-Edit: How a description gets entered

| | Approach |
|---|----------|
| **C-Edit-A** | **Extend `EditTextDialog`** — optional second field (description) shown when the caller passes a flag; item edit shows both, group edit unchanged. Empty description saves as `null`. |
| **C-Edit-B** | **New dedicated dialog** — a separate `EditItemDialog` with title + description, leaving `EditTextDialog` untouched for groups. |

| Req | Requirement | Status | C-Edit-A | C-Edit-B |
|-----|-------------|--------|:--------:|:--------:|
| R4 | Add / edit / clear via existing affordance | Must-have | ✅ | ✅ |
| R3 | Empty = no description (clears to null) | Must-have | ✅ | ✅ |

**Notes:**
- Both work. A reuses one component (less code, shared behavior); B keeps each dialog single-purpose. Leaning A unless the shared dialog gets awkward.
- Note: the current `onUpdateItem` callback surface passes only `(itemId, text)`; either approach must widen it to carry the description (the underlying `updateItem` already accepts `Partial<TodoItem>`).

---

## C-Display: What "one-line" means visually

| | Approach |
|---|----------|
| **C-Display-A** | **Truncate to one line** — single line, `text-overflow: ellipsis`. Strictly "one-line"; long descriptions clip. |
| **C-Display-B** | **Inline-only, may wrap** — no block markdown (no headings/lists/paragraphs), but the text wraps naturally over 1–3 lines if long. |

| Req | Requirement | Status | C-Display-A | C-Display-B |
|-----|-------------|--------|:-----------:|:-----------:|
| R2 | Smaller / muted than title | Must-have | ✅ | ✅ |
| R3 | Absent when empty | Must-have | ✅ | ✅ |
| R5 | "One-line" semantics | Undecided | ✅ (literal one line) | ⚠️ (inline-only, wraps) |

**Notes:**
- This is a genuine product call — "one-line markdown" could mean the *grammar* is one-line (inline-only) or the *display* is one line (truncated). They're independent of rendering approach.

---

## Decided shape: S = S1 + S2(C-Render-B) + S3(C-Edit-B) + S4

All forks resolved:

| Fork | Choice | Consequence |
|------|--------|-------------|
| C-Render | 🟡 **B — library** (`react-markdown`) | Configured to allow **inline nodes only** (no headings/lists/block elements), so R5's "inline-only" is enforced by the renderer, not just CSS. `a` elements get `target="_blank" rel="noopener noreferrer"`; a `urlTransform`/scheme allowlist drops unsafe hrefs (R6). |
| C-Edit | 🟡 **B — dedicated `EditItemDialog`** | New component with a title `Input` + a multi-line description field (textarea). Empty description saves as `null`. `EditTextDialog` stays as-is for groups. |
| Display | 🟡 **Inline-only, wraps** (R5) | Rendered under the title, `text-sm text-muted-foreground`, wraps naturally; hidden entirely when `description` is null/empty (R3). |
| Done styling | 🟡 **Title only** (R7) | Description is **not** wrapped in the `item.done` line-through/muted span. |

### Concrete parts

| Part | Mechanism | Flag |
|------|-----------|:----:|
| **S1** | Migration adds `description` column, then a follow-up sets it **`NOT NULL DEFAULT ''`** (nulls backfilled to `''`) → regenerate `database.types.ts` → `TodoItem` gains `description: string`. Empty string, never null — no null-handling in the app. | |
| **S2** | `ItemDescription` component wrapping `react-markdown`: allowlist inline nodes + `a`; web-link anchors force new-tab + `rel` (tel/mailto hand off to the OS); `urlTransform` keeps react-markdown's safe defaults and additionally permits `tel:`. Remark plugins: **`remark-gfm`** (autolink URLs/emails, R9) + custom **`remarkPhoneNumbers`** (`libphonenumber-js` → `tel:` links, R10) | |
| **S3** | `EditItemDialog` (title + description textarea); wire through `onUpdateItem` widened from `(id, text)` to `(id, { text, description })`; empty description saves as `''` | |
| **S4** | In `TodoItem`, render `<ItemDescription>` beneath the title `<span>`, `text-sm text-muted-foreground`, only when `item.description` is truthy | |
| **S5** | **Text format** — extracted to `lib/todoTextFormat.ts` (`parseTodoText` + `serializeTodos`, shared types) so import/export can't drift. Group titles are ATX headings (`# Name`); items `- [ ]`/`- [x]`; `>`-prefixed description lines attached to the item above (consecutive `>` join with `\n`, bare `>` = paragraph break). Export emits `#`; parser also accepts bare-line groups for back-compat. Verified lossless round-trip | |
| **S6** | **Import** — `BatchImportDialog` uses `parseTodoText`; preview renders live via `ItemDescription`; import writes `description` through to the insert. LLM prompt + placeholder + dialog copy document the `>` syntax. **Add vs. Replace**: a "Replace current list" checkbox (shown only when the list is non-empty) deletes the list's groups first (FK cascade clears items), then inserts at position 0; append remains the default. Destructive path uses a red button + warning line | |
| **S7** | **Export** — `ExportDialog` (new "Export as text" navbar action) runs `serializeTodos(groups, items)` into a read-only textarea + copy button, for round-tripping through an LLM back into import | |

### Remaining wiring note

The `onUpdateItem: (itemId, text) => void` prop threads through `TodoGroup` → `list.tsx`. Widen it (e.g. `(itemId, updates: { text: string; description: string | null }) => void`) so the dedicated dialog can submit both fields in one call.

**Status: shape fully decided — ready to slice / implement.**
