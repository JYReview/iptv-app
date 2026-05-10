import { memo } from "react";

const statusStyles = {
  Available: "text-emerald-400",
  "Not Working": "text-red-400",
  "Checking...": "text-cyan-400",
  "Not Started": "text-slate-400",
};

function ChannelCard({
  title,
  subtitle,
  logo,
  status = "Not Started",
  badge,
  actionLabel,
  onActionClick,
  active = false,
  onClick,
  focusProps = {},
  className = "",
}) {
  const {
    ref,
    tabIndex = 0,
    onFocus,
    onKeyDown: focusOnKeyDown,
    ...restFocus
  } = focusProps;

  return (
    <div
      role="button"
      ref={ref}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onClick={onClick}
      onKeyDown={(event) => {
        focusOnKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:bg-slate-900/95 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:p-5 ${
        active ? "ring-2 ring-cyan-400/40" : ""
      } ${className}`}
      {...restFocus}
    >
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Logo */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800 ring-1 ring-white/10">
              {logo ? (
                <img
                  src={logo}
                  alt={title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                  TV
                </div>
              )}
            </div>

            {/* Text */}
            <div className="min-w-0 space-y-1">
              <p className="truncate text-base font-semibold text-white sm:text-lg">
                {title}
              </p>

              {subtitle ? (
                <p className="line-clamp-2 text-xs text-slate-400 sm:text-sm">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          {/* Badge */}
          {badge ? (
            <span className="flex-shrink-0 rounded-2xl bg-white/5 px-2 py-1 text-xs uppercase tracking-[0.28em] text-slate-300 sm:px-3">
              {badge}
            </span>
          ) : null}
        </div>

        {actionLabel ? (
          <div className="right-4 top-4 sm:right-5 sm:top-5">
            <button
              type="button"
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation();
                onActionClick?.();
              }}
              className="rounded-2xl bg-white/5 px-2 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300 transition hover:bg-cyan-500/10 sm:px-3 sm:py-2"
            >
              {actionLabel}
            </button>
          </div>
        ) : null}

        {/* Status */}
        <div
          className={`text-xs font-medium sm:text-sm ${
            statusStyles[status] || statusStyles["Not Started"]
          }`}
        >
          {status}
        </div>

        
      </div>
    </div>
  );
}

export default memo(ChannelCard);
