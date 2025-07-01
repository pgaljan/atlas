import { AnimatePresence, motion } from "framer-motion";
import { RiCloseLine } from "react-icons/ri";

const RendererModal = ({ isOpen, onClose, onSelect }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-gradient-to-br from-white via-[#f9f9f9] to-[#f1f1f1] rounded-3xl p-8 shadow-2xl max-w-md w-full text-center border border-gray-200"
            initial={{ scale: 0.85 }}
            animate={{
              scale: 1,
              transition: { type: "spring", stiffness: 260, damping: 20 },
            }}
            exit={{
              scale: 0.85,
              transition: { type: "spring", stiffness: 260, damping: 20 },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              onClick={onClose}
            >
              <RiCloseLine size={24} />
            </button>
            <h3 className="text-2xl font-extrabold mb-3 text-custom-main tracking-tight">
              Choose Renderer
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              How would you like to visualize this structure?
            </p>
            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect("markmap")}
                className="px-5 py-3 rounded-2xl bg-custom-main text-white font-semibold text-sm shadow-md transition hover:shadow-lg"
              >
                Markmap
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect("syncfusion")}
                className="px-5 py-3 rounded-2xl bg-blue-500 text-white font-semibold text-sm shadow-md transition hover:bg-blue-600 hover:shadow-lg"
              >
                Syncfusion
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RendererModal;
