const allowedTags = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "CODE",
  "DIV",
  "EM",
  "I",
  "IMG",
  "LI",
  "OL",
  "P",
  "S",
  "SPAN",
  "STRONG",
  "SUB",
  "SUP",
  "U",
  "UL",
]);

const allowedProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

export function sanitizeHtml(input: string): string {
  if (typeof window === "undefined") return input.replace(/<[^>]*>/g, "");

  const documentNode = new DOMParser().parseFromString(input, "text/html");
  const visit = (parent: ParentNode) => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const element = child as HTMLElement;
      if (
        [
          "SCRIPT",
          "STYLE",
          "IFRAME",
          "OBJECT",
          "EMBED",
          "SVG",
          "MATH",
        ].includes(element.tagName)
      ) {
        element.remove();
        continue;
      }

      visit(element);
      if (!allowedTags.has(element.tagName)) {
        element.replaceWith(...Array.from(element.childNodes));
        continue;
      }

      const href = element.getAttribute("href");
      const src = element.getAttribute("src");
      const alt = element.getAttribute("alt");
      for (const attribute of Array.from(element.attributes)) {
        element.removeAttribute(attribute.name);
      }

      if (element.tagName === "A" && href) {
        try {
          const url = new URL(href, window.location.origin);
          if (
            url.origin === window.location.origin ||
            allowedProtocols.has(url.protocol)
          ) {
            element.setAttribute("href", href);
            element.setAttribute("rel", "noopener noreferrer");
          }
        } catch {
          // Drop malformed links.
        }
      }
      if (element.tagName === "IMG" && src) {
        try {
          const url = new URL(src, window.location.origin);
          if (
            url.origin === window.location.origin ||
            ["http:", "https:"].includes(url.protocol)
          ) {
            element.setAttribute("src", url.href);
            if (alt) element.setAttribute("alt", alt);
          } else {
            element.remove();
          }
        } catch {
          element.remove();
        }
      }
    }
  };

  visit(documentNode.body);
  return documentNode.body.innerHTML;
}
