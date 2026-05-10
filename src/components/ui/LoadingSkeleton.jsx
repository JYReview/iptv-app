export default function LoadingSkeleton({ rows = 4, className = "" }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-24 rounded-[28px] bg-slate-800/90 animate-pulse"
        />
      ))}
    </div>
  );
}
