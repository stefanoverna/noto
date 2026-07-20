import type { ReactNode } from "react";
import type { Components, UrlTransform } from "react-markdown";

import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { remarkPhoneNumbers } from "@/lib/remarkPhoneNumbers";
import { cn } from "@/lib/utils";

// `remark-gfm` autolinks bare URLs and emails; `remark-breaks` turns single
// newlines (as typed in the textarea) into `<br>`, blank lines into new
// paragraphs; `remarkPhoneNumbers` autolinks international phone numbers.
const REMARK_PLUGINS = [remarkGfm, remarkBreaks, remarkPhoneNumbers];

// The default transform allows http(s), mailto, etc. but strips `tel:` — keep
// its safety checks and additionally permit the `tel:` links we generate.
const urlTransform: UrlTransform = (url) =>
  /^tel:/i.test(url) ? url : defaultUrlTransform(url);

// Normalize a URL-ish string for comparison: drop scheme, leading `www.`, and
// any trailing slash so an autolink's visible text can be matched to its href.
function normalizeUrl(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

// Bare-domain label for an http(s) href, e.g. `https://www.google.com/x` -> `google.com`.
function domainOf(href: string): string | null {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// A gfm autolink renders with its visible text equal to the URL. When that's
// the case we show just the domain; explicit `[label](url)` links keep `label`.
function shortenedLabel(
  href: string | undefined,
  children: ReactNode,
): ReactNode {
  if (href == null || typeof children !== "string") return children;
  if (normalizeUrl(children) !== normalizeUrl(href)) return children;

  return domainOf(href) ?? children;
}

interface ItemDescriptionProps {
  text: string;
  className?: string;
}

// Paragraphs, line breaks, and inline formatting (bold, italic, code,
// strikethrough, links). Heavier block syntax (headings, lists, blockquotes)
// is disallowed and unwrapped, so a stray "# " renders as plain text rather
// than a heading — descriptions stay prose, not documents.
const ALLOWED_ELEMENTS = [
  "p",
  "a",
  "strong",
  "em",
  "code",
  "del",
  "br",
  "text",
];

const components: Components = {
  // Real paragraphs, spaced apart; the first sits flush under the title.
  p: ({ children }) => <p className="mt-2 first:mt-0">{children}</p>,
  a: ({ children, href }) => {
    // Only web links open in a new tab; tel:/mailto: hand off to the OS.
    const isWebLink = href != null && /^https?:/i.test(href);

    return (
      <a
        className="underline underline-offset-2 hover:text-foreground"
        href={href}
        rel={isWebLink ? "noopener noreferrer" : undefined}
        target={isWebLink ? "_blank" : undefined}
      >
        {isWebLink ? shortenedLabel(href, children) : children}
      </a>
    );
  },
  code: ({ children }) => (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  ),
};

export function ItemDescription({ text, className }: ItemDescriptionProps) {
  return (
    <div
      className={cn(
        "text-sm text-muted-foreground leading-tight [overflow-wrap:anywhere]",
        className,
      )}
    >
      <ReactMarkdown
        unwrapDisallowed
        allowedElements={ALLOWED_ELEMENTS}
        components={components}
        remarkPlugins={REMARK_PLUGINS}
        urlTransform={urlTransform}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
