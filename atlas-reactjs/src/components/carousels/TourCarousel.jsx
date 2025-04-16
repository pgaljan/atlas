import React, { useEffect, useState, useMemo } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IoCloseSharp } from "react-icons/io5";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const cn = (...inputs) => twMerge(clsx(inputs));

const Carousel = ({ data = [], duration = 5000, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasData = useMemo(() => data.length > 0, [data]);

  useEffect(() => {
    if (!hasData) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, duration);

    return () => clearInterval(interval);
  }, [hasData, data.length, duration]);

  const handleDownload = () => {
    const currentItem = data[currentIndex];
    const fileUrl = currentItem?.fileUrl;
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      const fileExtension = fileUrl.substring(fileUrl.lastIndexOf("."));
      link.download = currentItem?.name
        ? `${currentItem.name}${fileExtension}`
        : "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("File URL is not available for download.");
    }
  };

  if (!hasData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center">
      <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 z-10"
        >
          <IoCloseSharp />
        </button>

        {/* Image Section */}
        <div className="w-full h-[300px] md:h-[400px] bg-gray-200">
          <img
            src={
              data[currentIndex]?.thumbnailUrl || data[currentIndex]?.fileUrl
            }
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title */}
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
          {/* Download Button on the left */}
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-md"
          >
            Download
          </button>

          <div className="flex flex-col items-center gap-2">
            {/* Dots */}
            <div className="flex gap-2">
              {data.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    currentIndex === index ? "bg-amber-500" : "bg-gray-300"
                  )}
                />
              ))}
            </div>

            {/* Left & Right Arrows*/}
            {data.length > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev === 0 ? prev : prev - 1))
                  }
                  disabled={currentIndex === 0}
                  className={`text-2xl ${
                    currentIndex === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:text-amber-500"
                  }`}
                >
                  <IoChevronBack />
                </button>

                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === data.length - 1 ? prev : prev + 1
                    )
                  }
                  disabled={currentIndex === data.length - 1}
                  className={`text-2xl ${
                    currentIndex === data.length - 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:text-amber-500"
                  }`}
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
