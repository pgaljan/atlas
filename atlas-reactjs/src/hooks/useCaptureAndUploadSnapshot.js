import { toPng } from "html-to-image";
import { uploadFile } from "../redux/slices/upload-files";
import { updateStructure } from "../redux/slices/structures";
import Cookies from "js-cookie";

const useCaptureAndUploadSnapshot = async (
  svgElement,
  structureId,
  dispatch,
  fetchStructures
) => {
  if (!svgElement) return;

  try {
    const clonedElement = svgElement.cloneNode(true);

    clonedElement.style.background =
      "radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)";
    clonedElement.style.backgroundSize = "10px 10px";

    const scaleFactor = 2;
    const { clientWidth: width, clientHeight: height } = svgElement;

    const translateX = -(width * (scaleFactor - 1)) / 2;
    const translateY = -(height * (scaleFactor - 1)) / 2;

    clonedElement.style.transform = `scale(${scaleFactor}) translate(${translateX}px, ${translateY}px)`;
    clonedElement.style.transformOrigin = "center";

    const dataUrl = await toPng(clonedElement, {
      pixelRatio: scaleFactor,
      width: width,
      height: height,
      canvasWidth: width,
      canvasHeight: height,
      backgroundColor: "transparent",
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

      fetchStructures();
    }
  } catch (error) {
    throw new Error(`Failed to capture and upload snapshot: ${error.message}`);
  }
};
export default useCaptureAndUploadSnapshot;
