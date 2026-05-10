import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Checker", to: "/checker" },
];

export default function Navbar({ brand = "IPTV Hub", className = "" }) {
  return (
    <header className={`bg-slate-950/95 border-b border-white/10 backdrop-blur-xl ${className}`}>
      <div className="mx-auto flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-3xl bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-300/20 font-semibold">
            TV
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Smart IPTV</p>
            <p className="text-lg font-semibold text-white">{brand}</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `rounded-3xl px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
