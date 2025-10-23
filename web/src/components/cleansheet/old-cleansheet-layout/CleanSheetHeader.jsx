export default function CleanSheetHeader({
  title = 'Canvas',
  subtitle = 'Your learning journey visualization',
  user = {},
}) {
  const statusDotColor = user.statusDotColor || 'bg-emerald-400';

  return (
    <header className="border-b border-border bg-card px-8 py-6 flex items-start justify-between">
      <div>
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm"
          aria-label="User menu"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${statusDotColor} inline-block`} />
          <span className="min-w-[64px] text-left">Learner</span>
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L6 6L11 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
