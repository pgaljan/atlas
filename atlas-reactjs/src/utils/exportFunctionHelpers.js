export function extractTextForPdfPreview(element, indent = 0) {
  if (!element) return [];

  const blockTags = new Set([
    "P",
    "DIV",
    "SECTION",
    "ARTICLE",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "LI",
    "UL",
    "OL",
    "BR",
    "PRE",
  ]);

  const result = [];

  function processNode(
    node,
    style = {},
    indentLevel = 0,
    listContext = null,
    output = result
  ) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.replace(/\s+/g, " ");
      if (text.trim()) {
        output.push({ text, ...style, indentLevel });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toUpperCase();
      const newStyle = { ...style };

      if (tag === "BR") {
        output.push({ text: "", ...style, indentLevel });
        return;
      }

      if (tag === "IMG") {
        const src = node.getAttribute("src");
        const width = parseInt(node.getAttribute("width")) || 50;
        const height = parseInt(node.getAttribute("height")) || 30;
        if (src) {
          output.push({ type: "image", src, width, height, indentLevel });
        }
        return;
      }

      if (tag === "PRE") {
        output.push({ text: node.textContent.trim(), mono: true, indentLevel });
        return;
      }

      if (tag === "STRONG" || tag === "B") newStyle.bold = true;
      if (tag === "EM" || tag === "I") newStyle.italic = true;
      if (tag === "CODE") newStyle.mono = true;

      if (tag === "A") {
        const href = node.getAttribute("href") || "#";
        const linkParts = [];
        node.childNodes.forEach((child) =>
          processNode(
            child,
            { ...newStyle, underline: true, color: "#0000EE", link: href },
            indentLevel,
            listContext,
            linkParts
          )
        );
        output.push(...linkParts);
        return;
      }

      if (tag === "LI") {
        let prefix = "- ";
        if (listContext?.type === "ol") {
          prefix = `${listContext.index}. `;
          listContext.index++;
        } else if (listContext?.type === "ul") {
          prefix = "• ";
        }

        const liParts = [];
        node.childNodes.forEach((child) =>
          processNode(child, newStyle, indentLevel + 1, listContext, liParts)
        );

        if (liParts.length) {
          const [first, ...rest] = liParts;
          output.push({
            ...first,
            text: prefix + first.text,
            indentLevel,
          });
          rest.forEach((part) =>
            output.push({ ...part, indentLevel: indentLevel + 1 })
          );
        } else {
          output.push({ text: prefix, ...newStyle, indentLevel });
        }
        return;
      }

      if (tag === "UL" || tag === "OL") {
        const listType = tag.toLowerCase();
        const listContextNew = { type: listType, index: 1 };
        node.childNodes.forEach((child) =>
          processNode(child, newStyle, indentLevel, listContextNew, output)
        );
        return;
      }

      if (/^H[1-6]$/.test(tag)) {
        const level = parseInt(tag[1]);
        const sizes = [22, 18, 16, 14, 13, 12];
        newStyle.bold = true;
        newStyle.size = sizes[level - 1];
        newStyle.isHeading = true;
        const headingText = extractTextContent(node);
        if (headingText) {
          output.push({ text: headingText, ...newStyle, indentLevel });
        }
        return;
      }

      if (blockTags.has(tag)) {
        const paragraph = [];
        node.childNodes.forEach((child) =>
          processNode(child, newStyle, indentLevel, listContext, paragraph)
        );

        if (paragraph.length) {
          output.push({ type: "paragraph", content: paragraph, indentLevel });
        }
        return;
      }

      node.childNodes.forEach((child) =>
        processNode(child, newStyle, indentLevel, listContext, output)
      );
    }
  }

  function extractTextContent(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.replace(/\s+/g, " ").trim();
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      return [...node.childNodes].map(extractTextContent).join(" ").trim();
    }
    return "";
  }

  element.childNodes.forEach((child) => processNode(child, {}, indent, null));

  return result;
}
