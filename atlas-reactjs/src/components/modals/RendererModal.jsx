import { AnimatePresence, motion } from "framer-motion";

const RendererModal = ({ isOpen, onClose, onSelect }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center relative border border-[#e0b4b4]"
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.85 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-2 text-[#660000]">Open in…</h3>
            <p className="text-sm text-gray-600 mb-5">
              Choose a renderer for this structure
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => onSelect("markmap")}
                className="px-4 py-2 rounded-xl bg-custom-main text-white font-semibold text-sm transition hover:bg-red-800"
              >
                Markmap
              </button>
              <button
                onClick={() => onSelect("syncfusion")}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold text-sm transition hover:bg-blue-600"
              >
                Syncfusion
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RendererModal;
