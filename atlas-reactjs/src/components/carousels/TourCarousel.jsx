import React, { useState, useMemo } from "react";
import { clsx } from "clsx";
import Cookies from "js-cookie";
import { twMerge } from "tailwind-merge";
import { IoCloseSharp, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useDispatch } from "react-redux";
import cogoToast from "@successtar/cogo-toast";
import { restoreFullFromUrl } from "../../redux/slices/restore-backups";
import { useNavigate } from "react-router-dom";

const cn = (...inputs) => twMerge(clsx(inputs));

const Carousel = ({ data = [], onClose, onUseTemplate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const username = Cookies.get("atlas_username");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const hasData = useMemo(() => data.length > 0, [data]);

  const handleUseTemplate = async () => {
    const currentItem = data[currentIndex];
    const fileUrl = currentItem?.fileUrl;

    if (!fileUrl) {
      return cogoToast.error("No template file available to use.");
    }

    try {
      setIsUploading(true);
      const response = await dispatch(restoreFullFromUrl(fileUrl)).unwrap();

      cogoToast.success("Template applied successfully!");
      const structureId = response?.result?.structureId;
      if (structureId) {
        (onUseTemplate || onClose)?.();
        setTimeout(() => {
          navigate(`/app/s/${username}/${structureId}`);
        }, 1000);
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.error ||
        "Something went wrong while using the template.";
      cogoToast.error(`${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!hasData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center">
      <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 z-10"
        >
          <IoCloseSharp />
        </button>

        {/* Preview */}
        <div className="w-full h-[300px] md:h-[400px] bg-gray-200">
          <img
            src={
              data[currentIndex]?.thumbnailUrl || data[currentIndex]?.fileUrl
            }
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="px-4 py-2 bg-white">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            {data[currentIndex]?.name}
          </h2>
          <p className="text-sm md:text-[14px] font-semibold text-gray-800">
            {data[currentIndex]?.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
          <button
            onClick={handleUseTemplate}
            disabled={isUploading}
            className={cn(
              "px-4 py-2 text-white text-sm rounded-md",
              isUploading
                ? "bg-gray-500 text-white cursor-wait"
                : "bg-custom-main hover:opacity-65"
            )}
          >
            {isUploading ? "Applying..." : "Use this template"}
          </button>

          {/* Pagination */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              {data.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    currentIndex === idx ? "bg-amber-500" : "bg-gray-300"
                  )}
                />
              ))}
            </div>
            {data.length > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentIndex((i) => (i === 0 ? i : i - 1))}
                  disabled={currentIndex === 0}
                  className={
                    currentIndex === 0
                      ? "text-gray-400 cursor-not-allowed text-2xl"
                      : "text-gray-700 hover:text-amber-500 text-2xl"
                  }
                >
                  <IoChevronBack />
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((i) => (i === data.length - 1 ? i : i + 1))
                  }
                  disabled={currentIndex === data.length - 1}
                  className={
                    currentIndex === data.length - 1
                      ? "text-gray-400 cursor-not-allowed text-2xl"
                      : "text-gray-700 hover:text-amber-500 text-2xl"
                  }
                >
                  <IoChevronForward />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
