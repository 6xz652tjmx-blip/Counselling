import { useEffect, useMemo, useState } from "react";
import { getResources } from "../lib/api";
import { BookOpen, Clock } from "lucide-react";

const CATS = ["All", "For Parents", "For Children", "Systemic", "Self-Care"];

export default function Resources() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("All");

  useEffect(() => {
    getResources().then(setItems).catch(() => {});
  }, []);

  const filtered = useMemo(
    () => (cat === "All" ? items : items.filter((i) => i.category === cat)),
    [items, cat]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20" data-testid="resources-page">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-12">
        <div className="lg:col-span-7">
          <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#9C3D22]">
            The Library
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight mt-4 leading-[1.02]">
            What no one hands you with the court order.
          </h1>
        </div>
        <p className="lg:col-span-5 text-[#5C5651] leading-relaxed">
          Plain-language reads on court-ordered counselling, custody trauma,
          documenting safely, and protecting a child's voice. Built by
          therapists and survivors of the system.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10" data-testid="resources-filters">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              cat === c
                ? "bg-[#1F1A17] text-[#F9F7F3] border-[#1F1A17]"
                : "bg-white text-[#1F1A17] border-[#E5E1D8] hover:bg-[#F1EFEB]"
            }`}
            data-testid={`resource-filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => (
          <article
            key={r.id}
            className="group bg-white border border-[#E5E1D8] rounded-2xl p-7 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            data-testid={`resource-card-${r.id}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#F1EFEB] text-[#5A7059] font-semibold tracking-wider uppercase">
                {r.category}
              </span>
              <span className="text-xs text-[#5C5651] inline-flex items-center gap-1">
                <Clock size={12} /> {r.read_time}
              </span>
            </div>
            <h3 className="font-display text-xl md:text-2xl font-semibold mt-5 leading-snug group-hover:text-[#9C3D22] transition-colors">
              {r.title}
            </h3>
            <p className="text-sm text-[#5C5651] mt-3 leading-relaxed">{r.summary}</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#1F1A17] link-underline">
              <BookOpen size={14} /> Read more
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
