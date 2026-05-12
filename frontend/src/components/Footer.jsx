import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="bg-[#1F1A17] text-[#F9F7F3] mt-24"
      data-testid="site-footer"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#9C3D22]" />
            <span className="font-display text-2xl font-semibold">Unbound</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-[#F9F7F3]/70 leading-relaxed">
            A grounded space for parents and children carrying the weight of
            family court. We name what the system pretends isn't there — and
            help you breathe again.
          </p>
          <p className="mt-6 text-xs text-[#F9F7F3]/50 max-w-sm">
            Unbound is not a substitute for legal counsel or licensed mental
            health care. In crisis, call 988 (US) or your local emergency line.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#F9F7F3]/50 mb-4">
            Explore
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/counselors" className="hover:text-[#9C3D22]">Counsellors</Link></li>
            <li><Link to="/stories" className="hover:text-[#9C3D22]">Stories</Link></li>
            <li><Link to="/resources" className="hover:text-[#9C3D22]">Resources</Link></li>
            <li><Link to="/chat" className="hover:text-[#9C3D22]">Talk to Anchor</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#F9F7F3]/50 mb-4">
            Connect
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-[#9C3D22]">About Unbound</Link></li>
            <li><Link to="/contact" className="hover:text-[#9C3D22]">Contact</Link></li>
            <li><Link to="/stories#share" className="hover:text-[#9C3D22]">Share your story</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[#F9F7F3]/50">
          <p>© {new Date().getFullYear()} Unbound. Built for the unheard.</p>
          <p className="font-mono">v1.0 · Made with care</p>
        </div>
      </div>
    </footer>
  );
}
