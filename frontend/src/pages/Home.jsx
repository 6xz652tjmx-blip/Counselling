import { Link } from "react-router-dom";
import { ArrowUpRight, Quote, ShieldCheck, HeartHandshake, Scale, Users, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { getStories, getCounselors } from "../lib/api";

const HERO_BG =
  "https://images.unsplash.com/photo-1776544717878-36385659694f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxzdW5saWdodCUyMGJyZWFraW5nJTIwdGhyb3VnaCUyMGRhcmslMjBjbG91ZHMlMjBob3BlfGVufDB8fHx8MTc3ODU0NTQ3NXww&ixlib=rb-4.1.0&q=85";
const TEXTURE =
  "https://images.unsplash.com/photo-1662658826032-057302848ff7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHdhcm0lMjBjbGF5JTIwdGV4dHVyZXxlbnwwfHx8fDE3Nzg1NDU0Nzl8MA&ixlib=rb-4.1.0&q=85";
const SUPPORT =
  "https://images.unsplash.com/photo-1646066489838-aa1eddbe5964?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHw0fHxzdXBwb3J0JTIwZ3JvdXAlMjB0aGVyYXB5fGVufDB8fHx8MTc3ODU0NTQ2M3ww&ixlib=rb-4.1.0&q=85";

const TRUTHS = [
  "Court orders don't measure heartbreak.",
  "A mandate is not the same as care.",
  "Children are not court exhibits.",
  "Fair on paper. Brutal in practice.",
  "Survival is not a verdict.",
  "Your story is not a case number.",
];

function CheckIcon() {
  return (
    <span className="inline-flex w-4 h-4 rounded-full bg-[#9C3D22] text-white items-center justify-center text-[10px] mt-0.5 flex-shrink-0">
      ✓
    </span>
  );
}

export default function Home() {
  const [stories, setStories] = useState([]);
  const [counselors, setCounselors] = useState([]);

  useEffect(() => {
    getStories().then(setStories).catch(() => {});
    getCounselors().then(setCounselors).catch(() => {});
  }, []);

  return (    <div data-testid="home-page">
      {/* HERO */}
      <section
        className="relative overflow-hidden border-b border-[#E5E1D8]"
        data-testid="hero-section"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F1A17]/85 via-[#1F1A17]/55 to-[#1F1A17]/10" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-36 lg:py-44 text-[#F9F7F3]">
          <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#F9F7F3]/70 fade-up">
            For families surviving the family court system
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight leading-[0.95] mt-6 max-w-4xl fade-up delay-1">
            The court ordered counselling.
            <br />
            <span className="text-[#E27A4D]">It didn't order them to listen.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base md:text-lg text-[#F9F7F3]/80 leading-relaxed fade-up delay-2">
            Unbound is a grounded space for the parents and children carrying
            the emotional weight of family court. Find counsellors who
            understand mandates, hear stories the system erased, and breathe
            again — without performing it.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4 fade-up delay-3">
            <Link
              to="/counselors"
              className="inline-flex items-center gap-2 bg-[#9C3D22] hover:bg-[#7A2E19] text-white rounded-full px-7 py-3.5 font-medium transition-colors"
              data-testid="hero-cta-find-counsellor"
            >
              Find a counsellor <ArrowUpRight size={18} />
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 border border-white/40 text-white hover:bg-white/10 rounded-full px-7 py-3.5 font-medium transition-colors"
              data-testid="hero-cta-talk-anchor"
            >
              Talk to Anchor (free)
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl fade-up delay-4">
            {[
              { k: "73%", v: "of parents report severe stress from court-ordered processes" },
              { k: "2.1×", v: "anxiety risk for kids in high-conflict custody" },
              { k: "6", v: "vetted counsellors in our directory" },
              { k: "24/7", v: "AI guidance from Anchor" },
            ].map((s, i) => (
              <div key={i} className="border-t border-white/20 pt-4" data-testid={`hero-stat-${i}`}>
                <p className="font-display text-3xl md:text-4xl font-semibold text-[#F9F7F3]">{s.k}</p>
                <p className="mt-1 text-xs md:text-sm text-[#F9F7F3]/70 leading-snug">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUTHS MARQUEE */}
      <section
        className="relative bg-[#9C3D22] text-[#F9F7F3] overflow-hidden"
        data-testid="truths-marquee"
      >
        <div className="flex marquee-track whitespace-nowrap py-5">
          {[...TRUTHS, ...TRUTHS].map((t, i) => (
            <span
              key={i}
              className="mx-10 font-display text-xl md:text-2xl tracking-tight"
            >
              {t} <span className="mx-6 opacity-50">/</span>
            </span>
          ))}
        </div>
      </section>

      {/* DECIPHER PROMO */}
      <section
        className="bg-[#F1EFEB] border-y border-[#E5E1D8]"
        data-testid="decipher-promo-section"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#9C3D22]">
                New · Decipher
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mt-3 leading-tight">
                Upload your court order. We'll translate it into something a parent can read.
              </h2>
              <p className="text-[#5C5651] mt-6 leading-relaxed max-w-2xl">
                Decipher uses AI to read your order, list the obligations,
                flag the deadlines, and recommend grounded next steps you can
                take this week. Educational — not legal advice — but written
                for the human holding the paper.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/decipher"
                  className="inline-flex items-center gap-2 bg-[#1F1A17] hover:bg-black text-white rounded-full px-7 py-3.5 font-medium transition-colors"
                  data-testid="home-decipher-cta"
                >
                  Decipher an order <ArrowUpRight size={16} />
                </Link>
                <Link
                  to="/decipher"
                  className="inline-flex items-center gap-2 border border-[#1F1A17] text-[#1F1A17] hover:bg-[#F9F7F3] rounded-full px-7 py-3.5 font-medium transition-colors"
                  data-testid="home-decipher-learn-more"
                >
                  See what you get
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-7">
                <div className="flex items-center gap-2 text-[#9C3D22]">
                  <FileText size={18} />
                  <p className="font-mono text-xs tracking-wider uppercase">
                    Decipher · sample output
                  </p>
                </div>
                <h3 className="font-display text-lg font-semibold mt-4 leading-snug">
                  Temporary order on custody and counselling
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-[#5C5651]">
                  <li className="flex gap-2"><CheckIcon /> Both parents to complete 8 weeks of court-ordered counselling.</li>
                  <li className="flex gap-2"><CheckIcon /> First counselling report due to court by week 6.</li>
                  <li className="flex gap-2"><CheckIcon /> Child's school records released to evaluator.</li>
                </ul>
                <p className="mt-5 text-xs text-[#5A7059] font-semibold uppercase tracking-wider">
                  Next steps
                </p>
                <p className="text-sm text-[#1F1A17] mt-2 leading-relaxed">
                  Book counsellor by Friday. Ask attorney about scope of school-records release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION BENTO */}
      <section
        className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28"
        data-testid="mission-section"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#9C3D22]">
              The mission
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mt-4 leading-tight">
              We were built for the people the courtroom forgets.
            </h2>
            <p className="text-[#5C5651] mt-6 text-base leading-relaxed">
              Family court is supposed to protect families. For most of the
              people who pass through it, it does the opposite. Unbound exists
              because mandated counselling, custody battles, and biased rulings
              leave wounds the system was never designed to dress.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1 mt-8 link-underline text-[#1F1A17] font-medium"
              data-testid="mission-about-link"
            >
              Read our full mission <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Scale, t: "Name the bias", d: "We don't pretend the system is fair. We help you navigate the parts that aren't." },
              { icon: HeartHandshake, t: "Counsellors who get it", d: "Directory of therapists specialized in court mandates and custody trauma." },
              { icon: Users, t: "Stories restored", d: "An anonymous archive of the experiences family court erases or reframes." },
              { icon: ShieldCheck, t: "Children, centered", d: "Resources to protect a child's voice when adults stop asking." },
            ].map(({ icon: Icon, t, d }, i) => (
              <div
                key={i}
                className="bg-white border border-[#E5E1D8] rounded-2xl p-7 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                data-testid={`mission-card-${i}`}
              >
                <Icon size={24} className="text-[#9C3D22]" strokeWidth={2} />
                <h3 className="font-display text-xl font-semibold mt-5">{t}</h3>
                <p className="text-sm text-[#5C5651] mt-2 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COUNSELORS */}
      <section
        className="bg-[#F1EFEB] border-y border-[#E5E1D8]"
        data-testid="counselors-preview-section"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#9C3D22]">
                Our counsellors
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mt-3 max-w-2xl leading-tight">
                Therapists who have read the order — and stayed on your side.
              </h2>
            </div>
            <Link
              to="/counselors"
              className="self-start inline-flex items-center gap-1 link-underline text-[#1F1A17] font-medium"
              data-testid="counselors-view-all"
            >
              View all counsellors <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counselors.slice(0, 3).map((c) => (
              <Link
                to={`/counselors?focus=${c.id}`}
                key={c.id}
                className="group bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                data-testid={`counselor-preview-${c.id}`}
              >
                <div className="aspect-[4/5] overflow-hidden bg-[#F1EFEB]">
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs tracking-[0.2em] uppercase text-[#5A7059] font-semibold">
                    {c.title}
                  </p>
                  <h3 className="font-display text-2xl font-semibold mt-2">{c.name}</h3>
                  <p className="text-sm text-[#5C5651] mt-2 line-clamp-2">{c.bio}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {c.specialties.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2.5 py-1 rounded-full bg-[#F1EFEB] text-[#1F1A17]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STORIES SECTION */}
      <section
        className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28"
        data-testid="stories-preview-section"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#9C3D22]">
              Stories the record didn't keep
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mt-4 leading-tight">
              What the order page never showed.
            </h2>
            <p className="text-[#5C5651] mt-6 leading-relaxed">
              Real, anonymous accounts from parents and children who lived
              inside the family court system. Read them. Believe them. Share
              your own when you're ready.
            </p>
            <Link
              to="/stories"
              className="inline-flex items-center gap-1 mt-8 link-underline text-[#1F1A17] font-medium"
              data-testid="stories-view-all"
            >
              Read all stories <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="lg:col-span-8 space-y-5">
            {stories.slice(0, 3).map((s, i) => (
              <article
                key={s.id}
                className="bg-white border border-[#E5E1D8] rounded-2xl p-7 md:p-9 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                data-testid={`story-preview-${i}`}
              >
                <Quote size={22} className="text-[#9C3D22]" />
                <h3 className="font-display text-xl md:text-2xl font-semibold mt-4 leading-snug">
                  {s.title}
                </h3>
                <p className="text-[#5C5651] mt-3 leading-relaxed">{s.body}</p>
                <p className="mt-5 text-xs tracking-[0.18em] uppercase text-[#5A7059] font-semibold">
                  — {s.pen_name} {s.state ? `· ${s.state}` : ""}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section
        className="relative overflow-hidden bg-[#1F1A17] text-[#F9F7F3]"
        data-testid="cta-band-section"
      >
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${TEXTURE})` }}
        />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-7">
              <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#E27A4D]">
                Anchor — your private guide
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold mt-5 leading-tight">
                Some nights, the court order weighs more than the kids you fought for.
              </h2>
              <p className="mt-6 max-w-xl text-[#F9F7F3]/75 leading-relaxed">
                Anchor is a free, private AI guide built specifically for
                people navigating family court trauma. It won't pretend the
                system is fair. It'll help you find one small next step.
              </p>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 mt-10 bg-[#5A7059] hover:bg-[#465845] text-white rounded-full px-7 py-3.5 font-medium transition-colors"
                data-testid="cta-band-chat"
              >
                Open Anchor <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="md:col-span-5">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={SUPPORT}
                  alt="A circle of community supporting each other"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
