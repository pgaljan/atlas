import React from "react"

export default function CoachCard() {
  const [selectedLeader, setSelectedLeader] = React.useState("Coach Sarah");
  const [isFollowing, setIsFollowing] = React.useState(true);
  const [isViewing, setIsViewing] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const [viewMode, setViewMode] = React.useState("Full Screen");

  const handleToggleFollow = () => setIsFollowing(!isFollowing);
  const handleToggleViewing = () => {
    setIsViewing(!isViewing);
    if (!isViewing) setIsSharing(false);
  };
  const handleToggleShare = () => {
    setIsSharing(!isSharing);
    if (!isSharing) setIsViewing(false);
  };

  return (
    <div className="relative bg-[#0B0E19] text-white rounded-xl overflow-hidden shadow-md border border-slate-700">
      <div className="p-4 flex items-center justify-between">
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="self-start bg-[#0D111C] text-xs font-medium text-white px-2.5 py-1 rounded-md mb-2">
            {isViewing ? "Viewing Mode" : isSharing ? "Sharing Mode" : "Follow Mode"}
          </div>

          <div className="w-16 h-16 rounded-full bg-[#14B8A6] flex items-center justify-center text-xl font-semibold">
            CS
          </div>

          <div className="mt-2 text-lg font-semibold text-white">Coach Sarah</div>
          <div className="mt-1 w-3 h-3 bg-[#14B8A6] rounded-full mx-auto"></div>
        </div>

        {isFollowing && (
          <div className="absolute right-4 top-4">
            <div className="w-9 h-9 rounded-md border border-white flex items-center justify-center bg-[#1E293B] text-sm font-medium">
              JM
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2 bg-[#0B0E19] px-4 pb-3">
        <button
          onClick={handleToggleFollow}
          className={`px-3 py-1 rounded-full border text-sm font-medium transition ${
            isFollowing
              ? "bg-[#FACC15]/20 border-[#FACC15]/30 text-[#FACC15]"
              : "bg-transparent border-slate-600 text-slate-300"
          }`}
        >
          <span>{isFollowing ? "👤 Following" : "👤 Follow"}</span>
        </button>

        <button
          onClick={handleToggleViewing}
          className={`px-3 py-1 rounded-full border text-sm font-medium transition flex items-center gap-1 ${
            isViewing
              ? "bg-blue-500/20 border-blue-400 text-blue-300"
              : "bg-transparent border-slate-600 text-slate-300"
          }`}
        >
          {isViewing && <span>👁️</span>}
          {isViewing ? "Viewing" : "Show Me"}
        </button>

        {isViewing && (
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="ml-1 mt-[10px] text-[11px] border border-gray-400 bg-white text-black rounded-sm px-1.5 py-[2px] outline-none cursor-pointer h-[22px]"
          >
            <option>Full Screen</option>
            <option>Canvas Only</option>
          </select>
        )}

        <button
          onClick={handleToggleShare}
          className={`px-3 py-1 rounded-full border text-sm font-medium transition ${
            isSharing
              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
              : "bg-transparent border-slate-600 text-slate-300"
          }`}
        >
          <span>{isSharing ? "🔗 Stop Sharing" : "🔗 Share"}</span>
        </button>
      </div>

      {isFollowing && (
        <div className="bg-[#FEF9C3] border-t border-[#FDE68A] text-black px-4 py-3 transition-all duration-300">
          <div className="text-sm font-semibold mb-2">Select Canvas Leader:</div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLeader("Jenny M.")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium ${
                selectedLeader === "Jenny M."
                  ? "bg-[#DBEAFE] border-[#3B82F6] text-[#1E40AF]"
                  : "bg-white border-gray-300 text-gray-600"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-[#3B82F6] text-white text-xs flex items-center justify-center font-semibold">
                J
              </div>
              Jenny M.
            </button>

            <button
              onClick={() => setSelectedLeader("Coach Sarah")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium ${
                selectedLeader === "Coach Sarah"
                  ? "bg-[#D1FAE5] border-[#10B981] text-[#065F46]"
                  : "bg-white border-gray-300 text-gray-600"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-[#10B981] text-white text-xs flex items-center justify-center font-semibold">
                C
              </div>
              Coach Sarah
            </button>
          </div>
        </div>
      )}

      <div className="bg-white text-black px-4 py-3 text-sm border-t border-gray-200">
        <div className="font-semibold">Weekly Check-in</div>
        <div className="text-gray-500 text-xs">2 participants</div>
        <div className="mt-2 text-[#EAB308] text-sm font-medium">
          {isSharing
            ? "You’re sharing your canvas"
            : isViewing
            ? `Viewing Coach Sarah's Screen (${viewMode})`
            : isFollowing
            ? `Following ${selectedLeader}’s Canvas`
            : "You are not following any leader"}
        </div>
      </div>
    </div>
  );
}
