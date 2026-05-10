export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8 ${className}`}>
      {children}
    </div>
  );
}
