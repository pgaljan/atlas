import cogoToast from "@successtar/cogo-toast"
import { jsPDF } from "jspdf"
import JSZip from "jszip"
import { assignNodeColors } from "../utils/markmapHelpers"
import * as d3 from "d3"

export const sanitizeTreeData = node => {
  return {
    content: node.name || node.content,
    color: node.color || null,
    depth: node.depth || 0,
    children: node.children ? node.children.map(sanitizeTreeData) : [],
  }
}

// Example: Export as DOC
export const exportAsDoc = treeData => {
  if (!treeData || !treeData.children || treeData.children.length === 0) {
    cogoToast.warn("No elements found to export.")
    return
  }
  const zip = new JSZip()
  const now = new Date()
  const timestamp = now.toLocaleString()
  const filenameTimestamp = now.toISOString().replace(/[:.]/g, "-")
  const structureTitle =
    treeData && treeData.content ? treeData.content : "Markmap Export"

  // Process each node (if needed)
  const processNode = node => {
    if (!node) return
    const elementName = node.name || "Untitled"
    if (node.Record) {
      const record = node.Record
      const recordContent =
        (record.metadata && record.metadata.content) || "<p>No content</p>"
      const recordTags = Array.isArray(record.tags)
        ? record.tags.map(tag => `${tag.key}: ${tag.value}`).join(", ")
        : ""
      const docContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8">
    <title>${elementName}</title>
    <style>
      body { font-family: Arial, sans-serif; }
      h1 { color: #333; }
      p { font-size: 14px; }
    </style>
  </head>
  <body>
    <h1>${elementName}</h1>
    <p>Exported on: ${timestamp}</p>
    <div>${recordContent}</div>
    ${recordTags ? `<p><strong>Tags:</strong> ${recordTags}</p>` : ""}
  </body>
</html>
      `
      const fileName = `${elementName.replace(
        /\s+/g,
        "_"
      )}_${filenameTimestamp}.doc`
      zip.file(fileName, docContent)
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => processNode(child))
    }
  }

  treeData.children.forEach(child => processNode(child))

  // Before sanitizing, optionally assign custom colors (if not already present)
  // Example using d3.schemeCategory10 (could also use a 20-color scale if needed)
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  treeData.children.forEach((topLevelNode, index) => {
    // Here we use a fixed color for the top-level and its descendants.
    const color = colorScale(index)
    assignNodeColors(topLevelNode, () => color)
  })

  const sanitizedData = sanitizeTreeData(treeData)

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
        const data = ${JSON.stringify(sanitizedData, null, 2)};
        const markmapInstance = window.markmap.Markmap.create("#mindmap", {
          // Ensure the color function reads from the custom 'color' attribute
          color: node => node.color || "#1f77b4"
        }, data);
      };
    </script>
  </body>
</html>
  `
  zip.file(
    `${structureTitle.replace(/\s+/g, "_")}_${filenameTimestamp}_export.html`,
    htmlContent
  )

  zip
    .generateAsync({ type: "blob" })
    .then(content => {
      const link = document.createElement("a")
      link.href = URL.createObjectURL(content)
      link.download = `${structureTitle.replace(
        /\s+/g,
        "_"
      )}_${filenameTimestamp}.zip`
      link.click()
    })
    .catch(error => {
      cogoToast.error("Failed to generate ZIP file.")
    })
}

// Example: Export as PDF (similar logic applies)
export const exportAsPdf = async treeData => {
  if (!treeData || !treeData.children || treeData.children.length === 0) {
    cogoToast.warn("No elements found to export.")
    return
  }
  const zip = new JSZip()
  const now = new Date()
  const timestamp = now.toLocaleString()
  const filenameTimestamp = now.toISOString().replace(/[:.]/g, "-")
  const structureTitle =
    treeData && treeData.content ? treeData.content : "Markmap Export"

  // Helper to strip HTML tags
  const stripHtml = html => {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const processNode = async node => {
    if (!node) return
    const elementName = node.name || "Untitled"
    if (node.Record) {
      const record = node.Record
      const recordContent = record.metadata?.content || "No content"
      const recordTags =
        record.tags?.map(tag => `${tag.key}: ${tag.value}`).join(", ") || ""
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text(`${elementName}`, 10, 20)
      doc.setFontSize(12)
      doc.text(`Exported on: ${timestamp}`, 10, 30)

      // Extract images from HTML
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = recordContent
      const images = tempDiv.getElementsByTagName("img")

      let yOffset = 40
      for (let img of images) {
        try {
          const imageData = img.src
          const width = 80
          const height = 80
          doc.addImage(imageData, "JPEG", 10, yOffset, width, height)
          yOffset += height + 10
        } catch (error) {
          console.error("Error embedding image:", error)
        }
      }

      // Add text content after images
      const plainContent = stripHtml(recordContent.replace(/<img[^>]*>/g, ""))
      const textLines = doc.splitTextToSize(plainContent, 180)
      doc.text(textLines, 10, yOffset)

      if (recordTags) {
        doc.text(`Tags: ${recordTags}`, 10, yOffset + textLines.length * 10)
      }

      const pdfBlob = doc.output("blob")
      const fileName = `${elementName.replace(/\s+/g, "_")}.pdf`
      zip.file(fileName, pdfBlob)
    }

    if (node.children?.length) {
      for (const child of node.children) {
        await processNode(child)
      }
    }
  }

  for (const child of treeData.children) {
    await processNode(child)
  }

  // Optionally assign custom colors before sanitizing
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  treeData.children.forEach((topLevelNode, index) => {
    const color = colorScale(index)
    assignNodeColors(topLevelNode, () => color)
  })

  const sanitizedData = sanitizeTreeData(treeData)
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
        const data = ${JSON.stringify(sanitizedData, null, 2)};
        const markmapInstance = window.markmap.Markmap.create("#mindmap", {
          color: node => node.color || "#1f77b4"
        }, data);
      };
    </script>
  </body>
</html>
  `
  zip.file(
    `${structureTitle.replace(/\s+/g, "_")}_${filenameTimestamp}_export.html`,
    htmlContent
  )

  zip
    .generateAsync({ type: "blob" })
    .then(content => {
      const link = document.createElement("a")
      link.href = URL.createObjectURL(content)
      link.download = `${structureTitle.replace(
        /\s+/g,
        "_"
      )}_${filenameTimestamp}_pdf.zip`
      link.click()
    })
    .catch(error => {
      cogoToast.error("Failed to generate ZIP file.")
    })
}

// Export as a standalone HTML file.
export const exportAsHtml = treeData => {
  // Optionally assign the custom colors before sanitization
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  treeData.children.forEach((topLevelNode, index) => {
    const color = colorScale(index)
    assignNodeColors(topLevelNode, () => color)
  })

  const sanitizedData = sanitizeTreeData(treeData)
  const structureTitle =
    treeData && treeData.content ? treeData.content : "Markmap Export"
  const now = new Date()
  const timestamp = now.toLocaleString()
  const filenameTimestamp = now.toISOString().replace(/[:.]/g, "-")

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
    <p>Exported on: ${timestamp}</p>
    <svg id="mindmap"></svg>
    <script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.18.8/dist/browser/index.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-toolbar@0.18.8/dist/index.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/webfontloader@1.6.28/webfontloader.js" defer></script>
    <script>
      window.onload = function () {
        const data = ${JSON.stringify(sanitizedData, null, 2)};
        const markmapInstance = window.markmap.Markmap.create("#mindmap", {
          color: node => node.color || "#1f77b4"
        }, data);
      };
    </script>
  </body>
</html>
  `
  const blob = new Blob([htmlContent], { type: "text/html" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `${structureTitle.replace(
    /\s+/g,
    "_"
  )}_${filenameTimestamp}_export.html`
  link.click()
}
