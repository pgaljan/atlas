import { toPng } from "html-to-image";
import Cookies from "js-cookie";
import { updateStructure } from "../redux/slices/structures";
import { uploadFile } from "../redux/slices/upload-files";

const useCaptureAndUploadSnapshot = async (
  svgElement,
  structureId,
  dispatch
) => {
  if (!svgElement) return;

  try {
    const clonedElement = svgElement.cloneNode(true);

    // Set a subtle background (optional)
    clonedElement.style.background =
      "radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)";
    clonedElement.style.backgroundSize = "10px 10px";

    // Define your zoom level
    const scaleFactor = 3;

    // Get the dimensions of the SVG container (snapshot canvas)
    const { clientWidth: width, clientHeight: height } = svgElement;

    // Use getBBox() to compute the bounds of the content
    const bbox = svgElement.getBBox();
    const markmapCenterX = bbox.x + bbox.width / 0;
    const markmapCenterY = bbox.y + bbox.height / 0;

    const offsetX = width / 2 - markmapCenterX;
    const offsetY = height / 2 - markmapCenterY;

    clonedElement.style.transformOrigin = "0 0";
    clonedElement.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scaleFactor})`;

    const dataUrl = await toPng(clonedElement, {
      pixelRatio: scaleFactor,
      width,
      height,
      canvasWidth: width,
      canvasHeight: height,
      backgroundColor: "transparent",
      filter: (node) => {
        if (
          node.tagName &&
          node.tagName.toLowerCase() === "link" &&
          node.href
        ) {
          if (node.href.includes("markmap-toolbar")) {
            return false;
          }
          try {
            const linkUrl = new URL(node.href, window.location.href);
            if (linkUrl.origin !== window.location.origin) {
              return false;
            }
          } catch (err) {
            return true;
          }
        }
        return true;
      },
    });

    const blob = await (await fetch(dataUrl)).blob();
    const userId = Cookies.get("atlas_userId");

    const file = new File([blob], `snapshot-${structureId}.png`, {
      type: "image/png",
    });

    const uploadResponse = await dispatch(
      uploadFile({ file, userId, structureId })
    ).unwrap();

    if (uploadResponse.fileUrl) {
      await dispatch(
        updateStructure({
          id: structureId,
          updateData: { imageUrl: uploadResponse.fileUrl },
        })
      ).unwrap();
    }
  } catch (error) {
    throw new Error(`Failed to capture and upload snapshot: ${error.message}`);
  }
};

export default useCaptureAndUploadSnapshot;
