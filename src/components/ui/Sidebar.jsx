import { memo } from "react";
import { combineClasses } from "../../utils/uiUtils.js";

function Sidebar({ items = [], title = "Menu", className = "", onKeyDown }) {
  return (
    <aside
      className={combineClasses(
        "w-full max-w-[280px] rounded-[32px] border border-white/10 bg-slate-950/90 p-5 shadow-xl shadow-black/20",
        className,
      )}
      onKeyDown={onKeyDown}
    >
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">{title}</p>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <button
            key={item.key ?? item.id ?? `${item.label}-${index}`}
            type="button"
            onClick={item.onClick}
            tabIndex={item.focusProps?.tabIndex ?? 0}
            ref={item.focusProps?.ref}
            onFocus={item.focusProps?.onFocus}
            className={combineClasses(
              "flex w-full items-center justify-between rounded-3xl px-4 py-3 text-left text-sm font-medium transition",
              item.active
                ? "bg-cyan-500/10 text-white shadow-inner shadow-cyan-500/10"
                : "bg-white/5 text-slate-300 hover:bg-white/10",
            )}
          >
            <span>{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-300">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default memo(Sidebar);
