import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/counselors", label: "Counsellors" },
  { to: "/decipher", label: "Decipher Order" },
  { to: "/stories", label: "Stories" },
  { to: "/resources", label: "Resources" },
  { to: "/chat", label: "Talk to Anchor" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="sticky top-0 z-40 bg-[#F9F7F3]/85 backdrop-blur-md border-b border-[#E5E1D8]"
      data-testid="site-header"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 group"
          data-testid="nav-logo"
        >
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#9C3D22] group-hover:scale-125 transition-transform" />
          <span className="font-display text-2xl font-semibold tracking-tight">
            Unbound
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `text-sm link-underline ${
                  isActive
                    ? "text-[#9C3D22] font-semibold"
                    : "text-[#1F1A17] hover:text-[#9C3D22]"
                }`
              }
              data-testid={`nav-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/counselors"
            className="bg-[#9C3D22] text-white hover:bg-[#7A2E19] rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
            data-testid="nav-cta-find-help"
          >
            Find Help
          </Link>
        </nav>

        <button
          className="lg:hidden p-2 -mr-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          data-testid="nav-mobile-toggle"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div
          className="lg:hidden border-t border-[#E5E1D8] bg-[#F9F7F3] px-6 py-4 flex flex-col gap-3"
          data-testid="nav-mobile-menu"
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `py-1.5 text-base ${
                  isActive ? "text-[#9C3D22] font-semibold" : "text-[#1F1A17]"
                }`
              }
              data-testid={`nav-mobile-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
