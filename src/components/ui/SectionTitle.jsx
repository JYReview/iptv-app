export default function SectionTitle({ title, subtitle, description, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">{subtitle}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
        </div>
        {description ? (
          <p className="max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
