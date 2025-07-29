import cogoToast from "@successtar/cogo-toast";
import * as d3 from "d3";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { extractTextForPdfPreview } from "../utils/exportFunctionHelpers";
import {
  assignNodeColors,
  assignWbsNumbers,
  treeToMarkmapData,
} from "../utils/markmapHelpers";

export const sanitizeTreeData = (node) => {
  return {
    content: node.name || node.content,
    color: node.color || null,
    depth: node.depth || 0,
    wbs: node.wbs || "",
    children: node.children ? node.children.map(sanitizeTreeData) : [],
  };
};

export const exportAsDoc = (
  treeData,
  showWbs,
  includeWbs,
  includeTags,
  colorStrategy,
  isMarkmap = false
) => {
  if (!treeData || !treeData.children || treeData.children.length === 0) {
    cogoToast.warn("No elements found to export.");
    return;
  }

  const treeWithWbs = includeWbs ? assignWbsNumbers(treeData) : treeData;

  const zip = new JSZip();
  const now = new Date();
  const timestamp = now.toLocaleString();
  const filenameTimestamp = now.toISOString().replace(/[:.]/g, "-");
  const structureTitle =
    treeWithWbs && treeWithWbs.content ? treeWithWbs.content : "Markmap Export";

  const processNode = async (node) => {
    if (!node) return;
    const wbsPrefix = includeWbs && node.wbs ? `${node.wbs} ` : "";
    const elementName = node.name || "Untitled";

    if (node.Record) {
      const record = node.Record;
      const editorType = record.metadata?.editorType || "";
      const recordContent =
        editorType === "quilleditor"
          ? (record.metadata && record.metadata.content) || "<p>No content</p>"
          : "";
      const recordTags = Array.isArray(record.tags)
        ? record.tags.map((tag) => `${tag.key}: ${tag.value}`).join(", ")
        : "";

      let svgContent = "";

      if (record.recordSvg) {
        if (editorType === "markeddown") {
          svgContent = `<div>${record.recordSvg}</div>`;
        } else {
          const tempContainer = document.createElement("div");
          Object.assign(tempContainer.style, {
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: "100px",
          });
          tempContainer.innerHTML = record.recordSvg;
          document.body.appendChild(tempContainer);

          const svgElement = tempContainer.querySelector("svg");

          if (svgElement) {
            if (!svgElement.getAttribute("viewBox")) {
              const width = svgElement.getAttribute("width") || 100;
              const height = svgElement.getAttribute("height") || 100;
              svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
            }

            try {
              const imageDataURL = await toPng(svgElement, {
                pixelRatio: 5,
                cacheBust: true,
              });
              svgContent = `<img src="${imageDataURL}"  />`;
            } catch (err) {
              console.error("Error converting SVG with html-to-image:", err);
            }
          }

          document.body.removeChild(tempContainer);
        }
      }

      const docContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8">
    <title>${wbsPrefix}${elementName}</title>
    <style>
      body { font-family: Arial, sans-serif; }
      h1 { color: #333; }
      p { font-size: 14px; }
      img { max-width: 100%; margin: 10px 0; }
    </style>
  </head>
  <body>
    <h1>${wbsPrefix}${elementName}</h1>
    <p style="color: gray; font-size: 9px">Exported on: ${timestamp}</p>
    <div>${recordContent}</div>
  ${svgContent}
    ${
      includeTags && recordTags
        ? `<p><strong>Tags:</strong> ${recordTags}</p>`
        : ""
    }
  </body>
</html>
      `;
      const fileName = `${wbsPrefix}${elementName.replace(
        /\s+/g,
        "_"
      )}_${filenameTimestamp}.doc`;
      zip.file(fileName, docContent);
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        await processNode(child);
      }
    }
  };

  (async () => {
    for (const child of treeWithWbs.children) {
      await processNode(child);
    }

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const defaultStrategy = (index) => colorScale(index);

    if (isMarkmap) {
      treeWithWbs.children.forEach((topLevelNode, index) => {
        const color = defaultStrategy(index);
        assignNodeColors(topLevelNode, () => color);
      });
    } else if (typeof colorStrategy === "function") {
      treeWithWbs.children.forEach((topLevelNode, index) => {
        const color = colorStrategy(index);
        assignNodeColors(topLevelNode, () => color);
      });
    }

    const markmapData = treeToMarkmapData(treeWithWbs, showWbs, includeWbs);

    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>${structureTitle}</title>
    <style>
      * { margin: 0; padding: 0; }
      #mindmap { display: block; width: 100vw; height: 100vh; }
    </style>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.8/dist/style.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.min.css" />
  </head>
  <body>
    <svg id="mindmap"></svg>
    <script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.18.8/dist/browser/index.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.8/dist/index.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/webfontloader@1.6.28/webfontloader.js" defer></script>
    <script>
      window.onload = function () {
        const data = ${JSON.stringify(markmapData, null, 2)};
        window.markmap.Markmap.create("#mindmap", {
          color: node => node.color || "#1f77b4"
        }, data);
      };
    </script>
  </body>
</html>
    `;

    zip.file(
      `${structureTitle.replace(/\s+/g, "_")}_${filenameTimestamp}_export.html`,
      htmlContent
    );

    zip
      .generateAsync({ type: "blob" })
      .then((content) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `${structureTitle.replace(
          /\s+/g,
          "_"
        )}_${filenameTimestamp}.zip`;
        link.click();
      })
      .catch(() => {
        cogoToast.error("Failed to generate ZIP file.");
      });
  })();
};

export const exportAsPdf = async (
  treeData,
  includeWbs,
  includeTags,
  colorStrategy,
  isMarkmap = false
) => {
  if (!treeData || !treeData.children || treeData.children.length === 0) {
    cogoToast.warn("No elements found to export.");
    return;
  }
  const zip = new JSZip();
  const now = new Date();
  const filenameTimestamp = now.toISOString().replace(/[:.]/g, "-");
  const structureTitle =
    treeData && treeData.content ? treeData.content : "Markmap Export";

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const processNode = async (node) => {
    if (!node) return;
    const elementName = node.name || "Untitled";

    if (node.Record) {
      const record = node.Record;
      const recordContent = record.metadata?.content || "No content";
      const editorType = record.metadata?.editorType || "";
      const recordTags =
        record.tags?.map((tag) => `${tag.key}: ${tag.value}`).join(", ") || "";

      const doc = new jsPDF();
      const PAGE_HEIGHT = doc.internal.pageSize.height;
      const PAGE_MARGIN = 10;
      const MAX_Y = PAGE_HEIGHT - PAGE_MARGIN;
      let yOffset = 40;

      doc.setFontSize(16);
      doc.text(`${elementName}`, 10, 20);
      doc.setFontSize(12);

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = recordContent;
      const images = tempDiv.getElementsByTagName("img");

      for (let img of images) {
        try {
          const imageData = img.src;
          const width = 80;
          const height = 80;

          if (yOffset + height > MAX_Y) {
            doc.addPage();
            yOffset = PAGE_MARGIN;
          }

          doc.addImage(imageData, "JPEG", 10, yOffset, width, height);
          yOffset += height + 10;
        } catch (error) {
          console.error("Error embedding image:", error);
        }
      }

      if (record.recordSvg && editorType !== "markeddown") {
        try {
          const tempContainer = document.createElement("div");
          Object.assign(tempContainer.style, {
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: "800px",
          });
          document.body.appendChild(tempContainer);

          tempContainer.innerHTML = record.recordSvg;
          const svgElement = tempContainer.querySelector("svg");

          if (svgElement) {
            if (!svgElement.getAttribute("viewBox")) {
              const width = svgElement.getAttribute("width") || 800;
              const height = svgElement.getAttribute("height") || 600;
              svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
            }

            const dataUrl = await toPng(svgElement, {
              pixelRatio: 5,
              cacheBust: true,
            });

            const img = new Image();
            img.src = dataUrl;

            await new Promise((resolve) => {
              img.onload = () => {
                const targetWidth = 160;
                const aspectRatio = img.height / img.width;
                const targetHeight = targetWidth * aspectRatio;

                if (yOffset + targetHeight > MAX_Y) {
                  doc.addPage();
                  yOffset = PAGE_MARGIN;
                }

                doc.addImage(
                  dataUrl,
                  "PNG",
                  10,
                  yOffset,
                  targetWidth,
                  targetHeight
                );
                yOffset += targetHeight + 10;

                resolve();
              };
            });
          }

          document.body.removeChild(tempContainer);
        } catch (error) {
          console.error("Error converting SVG with html-to-image:", error);
        }
      }

      if (record.recordSvg && editorType === "markeddown") {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = record.recordSvg;

        const structuredLines = extractTextForPdfPreview(tempDiv);
        const baseX = 10;
        const indentX = 10;

        for (const line of structuredLines) {
          const {
            type,
            text,
            src,
            width = 50,
            height = 30,
            bold = false,
            italic = false,
            mono = false,
            size = 12,
            color = "#000000",
            underline = false,
            link = null,
            indentLevel = 0,
            isHeading = false,
            content = null,
          } = line;

          const xPos = baseX + indentX * indentLevel;

          if (type === "image" && src) {
            if (yOffset + height > 280) {
              doc.addPage();
              yOffset = 20;
            }
            doc.addImage(src, "JPEG", xPos, yOffset, width, height);
            yOffset += height + 5;
            continue;
          }

          if (type === "paragraph" && Array.isArray(content)) {
            let fullText = "";
            content.forEach((part) => {
              let styled = part.text;
              if (part.bold) styled = styled;
              if (part.italic) styled = styled;
              fullText += styled + " ";
            });
            doc.setFontSize(size);
            doc.setFont("helvetica", bold ? "bold" : "normal");
            doc.setTextColor(color);
            const lines = doc.splitTextToSize(fullText.trim(), 180 - xPos);
            lines.forEach((lineText) => {
              if (yOffset > 280) {
                doc.addPage();
                yOffset = 20;
              }
              doc.text(lineText, xPos, yOffset);
              yOffset += size + 1;
            });
            continue;
          }

          if (!text) {
            yOffset += 4;
            continue;
          }

          doc.setFontSize(size);
          if (mono) {
            doc.setFont("courier", italic ? "italic" : "normal");
          } else {
            if (bold && italic) doc.setFont("helvetica", "bolditalic");
            else if (bold) doc.setFont("helvetica", "bold");
            else if (italic) doc.setFont("helvetica", "italic");
            else doc.setFont("helvetica", "normal");
          }

          const lines = doc.splitTextToSize(text, 180 - xPos);
          for (const lineText of lines) {
            if (yOffset > 280) {
              doc.addPage();
              yOffset = 20;
            }

            if (link) {
              doc.setTextColor("#0000EE");
              doc.textWithLink(lineText, xPos, yOffset, { url: link });
              if (underline) {
                const textWidth = doc.getTextWidth(lineText);
                doc.setDrawColor("#0000EE");
                doc.setLineWidth(0.3);
                doc.line(xPos, yOffset + 1, xPos + textWidth, yOffset + 1);
              }
              doc.setTextColor(color);
            } else {
              doc.setTextColor(color);
              doc.text(lineText, xPos, yOffset);
            }

            yOffset += isHeading ? size : size + 1;
          }
        }
      }

      if (
        editorType !== "markeddown" &&
        editorType !== "plantuml" &&
        editorType !== "vscode"
      ) {
        const plainContent = stripHtml(
          recordContent.replace(/<img[^>]*>/g, "")
        );
        const lineHeight = 10;
        const maxLineWidth = 180;

        const textLines = doc.splitTextToSize(plainContent, maxLineWidth);

        for (let i = 0; i < textLines.length; i++) {
          if (yOffset + lineHeight > MAX_Y) {
            doc.addPage();
            yOffset = PAGE_MARGIN;
          }
          doc.text(textLines[i], 10, yOffset);
          yOffset += lineHeight;
        }
      }

      if (includeTags && recordTags) {
        const lineHeight = 10;
        if (yOffset + lineHeight > MAX_Y) {
          doc.addPage();
          yOffset = PAGE_MARGIN;
        }
        doc.text(`Tags: ${recordTags}`, 10, yOffset);
      }

      const pdfBlob = doc.output("blob");
      const fileName = `${elementName.replace(/\s+/g, "_")}.pdf`;
      zip.file(fileName, pdfBlob);
    }

    if (node.children?.length) {
      for (const child of node.children) {
        await processNode(child);
      }
    }
  };

  for (const child of treeData.children) {
    await processNode(child);
  }

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const defaultStrategy = (index) => colorScale(index);

  if (isMarkmap) {
    // Apply default color strategy ONLY for markmap
    treeData.children.forEach((topLevelNode, index) => {
      const color = defaultStrategy(index);
      assignNodeColors(topLevelNode, () => color);
    });
  } else {
    // Apply provided color strategy for Syncfusion
    if (typeof colorStrategy === "function") {
      treeData.children.forEach((topLevelNode, index) => {
        const color = colorStrategy(index);
        assignNodeColors(topLevelNode, () => color);
      });
    }
  }

  const markmapData = treeToMarkmapData(treeData, includeWbs);

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>${structureTitle}</title>
    <style>
      * { margin: 0; padding: 0; }
      #mindmap { display: block; width: 100vw; height: 100vh; }
    </style>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.8/dist/style.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.min.css" />
  </head>
  <body>
    <svg id="mindmap"></svg>
    <script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.18.8/dist/browser/index.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.8/dist/index.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/webfontloader@1.6.28/webfontloader.js" defer></script>
    <script>
      window.onload = function () {
        const data = ${JSON.stringify(markmapData, null, 2)};
        const markmapInstance = window.markmap.Markmap.create("#mindmap", {
          color: node => node.color || "#1f77b4"
        }, data);
      };
    </script>
  </body>
</html>
  `;
  zip.file(
    `${structureTitle.replace(/\s+/g, "_")}_${filenameTimestamp}_export.html`,
    htmlContent
  );

  zip
    .generateAsync({ type: "blob" })
    .then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `${structureTitle.replace(
        /\s+/g,
        "_"
      )}_${filenameTimestamp}_pdf.zip`;
      link.click();
    })
    .catch(() => {
      cogoToast.error("Failed to generate ZIP file.");
    });
};

export const exportAllAsSingleDoc = async (treeData, includeWbs = false, includeTags = false) => {
  if (!treeData || !treeData.children || treeData.children.length === 0) {
    cogoToast.warn("No elements found to export.");
    return;
  }

  // Apply WBS numbers if requested
  const treeWithWbs = includeWbs ? assignWbsNumbers(treeData) : treeData;

  const now = new Date();
  const timestamp = now.toLocaleString();
  const filenameTimestamp = now.toISOString().replace(/[:.]/g, "-");
  const structureTitle = treeWithWbs.content || "Combined_Markmap_Export";

  let combinedContent = "";

  const processNode = async (node) => {
    if (!node) return;

    if (node.Record) {
      const wbsPrefix = includeWbs && node.wbs ? `${node.wbs} ` : "";
      const elementName = node.name || "Untitled";
      const record = node.Record;
      const editorType = record.metadata?.editorType || "";
      const recordContent =
        editorType === "quilleditor"
          ? (record.metadata && record.metadata.content) || "<p>No content</p>"
          : "";
      const recordTags = Array.isArray(record.tags)
        ? record.tags.map((tag) => `${tag.key}: ${tag.value}`).join(", ")
        : "";

      let svgContent = "";

      if (record.recordSvg) {
        if (editorType === "markeddown") {
          svgContent = `<div>${record.recordSvg}</div>`;
        } else {
          const tempContainer = document.createElement("div");
          Object.assign(tempContainer.style, {
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: "100px",
          });
          tempContainer.innerHTML = record.recordSvg;
          document.body.appendChild(tempContainer);

          const svgElement = tempContainer.querySelector("svg");

          if (svgElement) {
            if (!svgElement.getAttribute("viewBox")) {
              const width = svgElement.getAttribute("width") || 100;
              const height = svgElement.getAttribute("height") || 100;
              svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
            }

            try {
              const imageDataURL = await toPng(svgElement, {
                pixelRatio: 5,
                cacheBust: true,
              });
              svgContent = `<img src="${imageDataURL}" />`;
            } catch (err) {
              console.error("Error converting SVG with html-to-image:", err);
            }
          }

          document.body.removeChild(tempContainer);
        }
      }

      const recordSection = `
        <hr />
        <h2>${wbsPrefix}${elementName}</h2>
        <div>${recordContent}</div>
        ${svgContent}

        ${
          includeTags && recordTags
            ? `<p><strong>Tags:</strong> ${recordTags}</p>`
            : ""
        }
      `;
      combinedContent += recordSection;
    }
    if (node.children?.length) {
      for (const child of node.children) {
        await processNode(child);
      }
    }
  };

  for (const child of treeWithWbs.children) {
    await processNode(child);
  }

  const fullDoc = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${structureTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        h1, h2 { color: #333; }
        p { font-size: 14px; }
        hr { margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>${structureTitle}</h1>
      <p style="color: gray; font-size: 9px;">Exported on: ${timestamp}</p>
      ${combinedContent}
    </body>
    </html>
  `;

  const blob = new Blob([fullDoc], { type: "application/msword" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${structureTitle.replace(
    /\s+/g,
    "_"
  )}_${filenameTimestamp}.doc`;
  link.click();
};

export const exportAsSinglePdf = async (
  treeData,
  showWbs,
  includeWbs,
  includeTags
) => {
  if (!treeData || !treeData.children || treeData.children.length === 0) {
    cogoToast.warn("No elements found to export.");
    return;
  }

  const now = new Date();
  const filenameTimestamp = now.toISOString().replace(/[:.]/g, "-");
  const structureTitle = treeData?.content || "Markmap Export";

  const stripHtml = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yOffset = 20;

  const addTextWithOverflow = (textLines) => {
    const lineHeight = 10;
    for (let line of textLines) {
      if (yOffset + lineHeight > pageHeight - 10) {
        doc.addPage();
        yOffset = 20;
      }
      doc.text(line, 10, yOffset);
      yOffset += lineHeight;
    }
  };

  const addImageWithOverflow = (imageData, width, height) => {
    if (yOffset + height > pageHeight - 10) {
      doc.addPage();
      yOffset = 20;
    }
    doc.addImage(imageData, "JPEG", 10, yOffset, width, height);
    yOffset += height + 10;
  };

  const processNode = async (node) => {
    if (!node) return;
    const elementName = node.name || "Untitled";

    if (node.Record) {
      const record = node.Record;
      const editorType = record.metadata?.editorType;
      const isRawContentOnly = ["markeddown", "vscode", "plantuml"].includes(
        editorType
      );
      const recordContent = isRawContentOnly
        ? null
        : record.metadata?.content || "No content";
      const recordTags =
        record.tags?.map((tag) => `${tag.key}: ${tag.value}`).join(", ") || "";

      if (yOffset > 20) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFontSize(16);
      doc.text(elementName, 10, yOffset);
      yOffset += 10;

      doc.setFontSize(12);

      if (record.recordSvg && editorType !== "markeddown") {
        const tempContainer = document.createElement("div");
        Object.assign(tempContainer.style, {
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "800px",
        });
        tempContainer.innerHTML = record.recordSvg;
        document.body.appendChild(tempContainer);

        const svgElement = tempContainer.querySelector("svg");

        if (svgElement) {
          if (!svgElement.getAttribute("viewBox")) {
            const width = svgElement.getAttribute("width") || 800;
            const height = svgElement.getAttribute("height") || 600;
            svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
          }

          try {
            const imageDataURL = await toPng(svgElement, {
              pixelRatio: 5,
              cacheBust: true,
            });
            addImageWithOverflow(imageDataURL, 100, 100);
          } catch (err) {
            console.error("Error converting SVG with html-to-image:", err);
          }
        }

        document.body.removeChild(tempContainer);
      }

      if (record.recordSvg && editorType === "markeddown") {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = record.recordSvg;

        const structuredLines = extractTextForPdfPreview(tempDiv);
        const baseX = 10;
        const indentX = 10;

        for (const line of structuredLines) {
          const {
            type,
            text,
            src,
            width = 50,
            height = 30,
            bold = false,
            italic = false,
            mono = false,
            size = 12,
            color = "#000000",
            underline = false,
            link = null,
            indentLevel = 0,
            isHeading = false,
            content = null,
          } = line;

          const xPos = baseX + indentX * indentLevel;

          if (type === "image" && src) {
            if (yOffset + height > 280) {
              doc.addPage();
              yOffset = 20;
            }
            doc.addImage(src, "JPEG", xPos, yOffset, width, height);
            yOffset += height + 5;
            continue;
          }

          if (type === "paragraph" && Array.isArray(content)) {
            let fullText = "";
            content.forEach((part) => {
              let styled = part.text;
              if (part.bold) styled = styled;
              if (part.italic) styled = styled;
              fullText += styled + " ";
            });
            doc.setFontSize(size);
            doc.setFont("helvetica", bold ? "bold" : "normal");
            doc.setTextColor(color);
            const lines = doc.splitTextToSize(fullText.trim(), 180 - xPos);
            lines.forEach((lineText) => {
              if (yOffset > 280) {
                doc.addPage();
                yOffset = 20;
              }
              doc.text(lineText, xPos, yOffset);
              yOffset += size + 1;
            });
            continue;
          }

          if (!text) {
            yOffset += 4;
            continue;
          }

          doc.setFontSize(size);
          if (mono) {
            doc.setFont("courier", italic ? "italic" : "normal");
          } else {
            if (bold && italic) doc.setFont("helvetica", "bolditalic");
            else if (bold) doc.setFont("helvetica", "bold");
            else if (italic) doc.setFont("helvetica", "italic");
            else doc.setFont("helvetica", "normal");
          }

          const lines = doc.splitTextToSize(text, 180 - xPos);
          for (const lineText of lines) {
            if (yOffset > 280) {
              doc.addPage();
              yOffset = 20;
            }

            if (link) {
              doc.setTextColor("#0000EE");
              doc.textWithLink(lineText, xPos, yOffset, { url: link });
              if (underline) {
                const textWidth = doc.getTextWidth(lineText);
                doc.setDrawColor("#0000EE");
                doc.setLineWidth(0.3);
                doc.line(xPos, yOffset + 1, xPos + textWidth, yOffset + 1);
              }
              doc.setTextColor(color);
            } else {
              doc.setTextColor(color);
              doc.text(lineText, xPos, yOffset);
            }

            yOffset += isHeading ? size : size + 1;
          }
        }
      }

      if (recordContent) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = recordContent;

        const images = tempDiv.getElementsByTagName("img");
        for (let img of images) {
          try {
            addImageWithOverflow(img.src, 80, 80);
          } catch (error) {
            console.error("Error embedding image:", error);
          }
        }

        const plainText = stripHtml(recordContent.replace(/<img[^>]*>/g, ""));
        const textLines = doc.splitTextToSize(plainText, 180);
        addTextWithOverflow(textLines);
      }

      if (includeTags && recordTags) {
        addTextWithOverflow([`Tags: ${recordTags}`]);
      }
    }

    if (node.children?.length) {
      for (const child of node.children) {
        await processNode(child);
      }
    }
  };

  for (const child of treeData.children) {
    await processNode(child);
  }

  doc.save(`${structureTitle.replace(/\s+/g, "_")}_${filenameTimestamp}.pdf`);
};

export const exportAsHtml = (
  treeData,
  includeWbs,
  colorStrategy,
  isMarkmap = false
) => {
  if (!treeData) {
    cogoToast.warn("No tree data found to export.");
    return;
  }

  // Clone tree to avoid mutating the original data
  const clonedTree = JSON.parse(JSON.stringify(treeData));

  if (includeWbs) {
    assignWbsNumbers(clonedTree);
  }

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const defaultStrategy = (index) => colorScale(index);

  const colorSource = clonedTree?.children || [];

  if (isMarkmap) {
    colorSource.forEach((topLevelNode, index) => {
      const color = defaultStrategy(index);
      assignNodeColors(topLevelNode, () => color);
    });
  } else if (typeof colorStrategy === "function") {
    colorSource.forEach((topLevelNode, index) => {
      const color = colorStrategy(index);
      assignNodeColors(topLevelNode, () => color);
    });
  }

  // Use only includeWbs to control WBS display
  const markmapData = treeToMarkmapData(clonedTree, includeWbs, includeWbs);

  const structureTitle = clonedTree?.content || "Markmap Export";
  const now = new Date();
  const filenameTimestamp = now.toISOString().replace(/[:.]/g, "-");

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>${structureTitle}</title>
    <style>
      * { margin: 0; padding: 0; }
      #mindmap { display: block; width: 100vw; height: 100vh; }
    </style>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.8/dist/style.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.min.css" />
  </head>
  <body>
    <h1>${structureTitle}</h1>
    <svg id="mindmap"></svg>
    <script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.18.8/dist/browser/index.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.8/dist/index.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/webfontloader@1.6.28/webfontloader.js" defer></script>
    <script>
      window.onload = function () {
        const data = ${JSON.stringify(markmapData, null, 2)};
        window.markmap.Markmap.create("#mindmap", {
          color: node => node.color || "#1f77b4"
        }, data);
      };
    </script>
  </body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${structureTitle.replace(
    /\s+/g,
    "_"
  )}_${filenameTimestamp}_export.html`;
  link.click();
};
