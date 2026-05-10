import { memo } from "react";

function FilterPill({
  label,
  active = false,
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
          : "bg-white/5 text-slate-300 hover:bg-white/10"
      } ${className}`}
    >
      {label}
    </button>
  );
}

export default memo(FilterPill);
