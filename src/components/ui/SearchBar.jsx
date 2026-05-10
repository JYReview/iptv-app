import { memo } from "react";

function SearchBar({
  value,
  onChange,
  placeholder = "Search channels...",
  className = "",
}) {
  return (
    <div className={`flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-sm ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 shrink-0 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
      />
    </div>
  );
}

export default memo(SearchBar);
