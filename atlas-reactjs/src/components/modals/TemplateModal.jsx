import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import { MdOutlineDone } from "react-icons/md";
import { TbTemplate } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { getStructureSummariesByWorkspaceId } from "../../redux/slices/structures";

const TemplatesModal = ({ onClose, onCreate }) => {
  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = useState(null);
  const [structures, setStructures] = useState([]);

  useEffect(() => {
    const workspaceId = Cookies.get("workspaceId");
    if (!workspaceId) return;

    const fetchSummaries = async () => {
      try {
        const resultAction = await dispatch(
          getStructureSummariesByWorkspaceId(workspaceId)
        );

        setStructures(resultAction.payload.summaries);
      } catch (error) {
        console.error("🔥 Error fetching summaries:", error);
      }
    };

    fetchSummaries();
  }, [dispatch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-custom-main/40 to-black/60 mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 bg-white rounded-2xl px-6 py-6 md:p-8 max-w-4xl w-full mx-4 shadow-xl animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-200 ">
          <div className="flex items-center gap-3 text-custom-main">
            <TbTemplate className="text-2xl text-gray-900" />
            <h2 className="text-xl md:text-2xl text-gray-900 font-semibold">
              Choose Structure to Save as Template
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-transform hover:scale-110"
            title="Close"
          >
            <HiOutlineXMark className="text-2xl" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="overflow-y-auto custom-scrollbar p-2"
          style={{ maxHeight: "55vh" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {structures.map((structure) => (
              <div
                key={structure.id}
                onClick={() => setSelectedId(structure.id)}
                className={`relative group border rounded-xl p-2 cursor-pointer transition hover:shadow-md overflow-hidden ${
                  selectedId === structure.id
                    ? "ring-2 ring-custom-main"
                    : "border-gray-300 "
                }`}
              >
                <img
                  src={structure.imageUrl}
                  alt={structure.name}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <div className="text-center capitalize text-sm font-medium text-gray-800 ">
                  {structure.name}
                </div>

                {selectedId === structure.id && (
                  <div className="absolute top-2 right-2 bg-custom-main text-white p-1 rounded-full">
                    <MdOutlineDone className="text-lg" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col md:flex-row justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 "
          >
            Cancel
          </button>
          <button
            onClick={() => onCreate(selectedId)}
            disabled={!selectedId}
            className="px-5 py-2 text-sm rounded-md bg-custom-main text-white font-medium hover:bg-custom-main/90 disabled:opacity-50"
          >
            Create Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
