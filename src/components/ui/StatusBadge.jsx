const STATUS_STYLES = {
  "Not Started": "bg-slate-700 text-slate-200",
  "Checking...": "bg-blue-500/10 text-blue-300",
  Available: "bg-emerald-500/10 text-emerald-300",
  "Not Working": "bg-red-500/10 text-red-300",
};

import { memo } from "react";

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${STATUS_STYLES[status] || STATUS_STYLES["Not Started"]}`}>
      {status}
    </span>
  );
}

export default memo(StatusBadge);
