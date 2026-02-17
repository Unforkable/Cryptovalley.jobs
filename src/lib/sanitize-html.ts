/**
 * Server-side HTML sanitizer for job descriptions.
 * Allowlist-based: only safe tags and attributes pass through.
 */

const ALLOWED_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "strong", "em", "b", "i", "u",
  "a",
  "div", "span",
  "table", "thead", "tbody", "tr", "td", "th",
  "blockquote", "pre", "code",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href"]),
};

/**
 * Sanitize HTML by stripping disallowed tags and attributes.
 * Allowed tags keep their text content; disallowed tags are removed
 * but their text content is preserved.
 */
export function sanitizeHtml(html: string): string {
  // Replace all HTML tags, keeping only allowed ones with allowed attributes
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/g, (match, tag: string, attrs: string) => {
    const tagLower = tag.toLowerCase();
    const isClosing = match.startsWith("</");

    if (!ALLOWED_TAGS.has(tagLower)) {
      return "";
    }

    if (isClosing) {
      return `</${tagLower}>`;
    }

    // Filter attributes
    const allowedAttrsForTag = ALLOWED_ATTRS[tagLower];
    let cleanAttrs = "";

    if (allowedAttrsForTag && attrs) {
      const attrMatches = attrs.matchAll(/([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g);
      for (const m of attrMatches) {
        const attrName = m[1].toLowerCase();
        const attrValue = m[2] ?? m[3] ?? m[4] ?? "";

        if (!allowedAttrsForTag.has(attrName)) continue;

        // For href, block javascript: URLs
        if (attrName === "href") {
          const trimmed = attrValue.trim().toLowerCase();
          if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:")) continue;
          cleanAttrs += ` href="${attrValue}" rel="nofollow noopener" target="_blank"`;
        } else {
          cleanAttrs += ` ${attrName}="${attrValue}"`;
        }
      }
    }

    const selfClosing = match.endsWith("/>");
    return `<${tagLower}${cleanAttrs}${selfClosing ? " /" : ""}>`;
  });
}

/** Check if a string contains HTML tags */
export function containsHtml(text: string): boolean {
  return /<[a-zA-Z][^>]*>/.test(text);
}
