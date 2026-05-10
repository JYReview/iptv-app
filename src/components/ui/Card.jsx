export default function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}
