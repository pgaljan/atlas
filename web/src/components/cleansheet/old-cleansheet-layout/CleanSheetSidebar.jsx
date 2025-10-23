
import React from "react"

export default function CleanSheetSidebar({
  brand = "CLEANSHEET",
  navItems = [{ key: "canvas", label: "Canvas", icon: "📦" }],
  viewMode = "learner",
  onChangeViewMode = () => {},
  activeNavKey = "canvas",
  onNavClick = () => {},
}) {
  const buttonClass = (active) =>
    `flex-1 px-4 py-2 rounded-md font-medium text-sm ${
      active
        ? "bg-emerald-500 text-white hover:bg-emerald-400"
        : "bg-transparent border border-gray-200 hover:bg-gray-50 text-gray-700"
    }`

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-gray-200 bg-white">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{brand}</h1>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map((item) => {
          const active = item.key === activeNavKey
          return (
            <button
              key={item.key}
              onClick={() => onNavClick(item.key)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
                active ? "bg-emerald-50 border-l-4 border-emerald-400 text-emerald-700" : "text-slate-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-500">View Mode:</span>
          <div className="flex gap-2">
            <button
              className={buttonClass(viewMode === "learner")}
              onClick={() => onChangeViewMode("learner")}
            >
              Learner
            </button>
            <button
              className={buttonClass(viewMode === "seeker")}
              onClick={() => onChangeViewMode("seeker")}
            >
              Seeker
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
