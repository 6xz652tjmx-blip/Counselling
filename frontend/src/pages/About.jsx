import { Link } from "react-router-dom";
import { Scale, HeartHandshake, ShieldCheck, Users, ArrowUpRight } from "lucide-react";

const TEXTURE =
  "https://images.unsplash.com/photo-1662658826032-057302848ff7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHdhcm0lMjBjbGF5JTIwdGV4dHVyZXxlbnwwfHx8fDE3Nzg1NDU0Nzl8MA&ixlib=rb-4.1.0&q=85";

const TENETS = [
  {
    icon: Scale,
    title: "We name the bias.",
    body: "Family court doesn't apply equally — by gender, by income, by race, by who can afford a louder lawyer. We refuse to pretend otherwise.",
  },
  {
    icon: HeartHandshake,
    title: "We center the unheard.",
    body: "Parents the system labelled difficult. Kids whose 'best interest' was decided in their absence. We exist for them first.",
  },
  {
    icon: ShieldCheck,
    title: "We protect privacy.",
    body: "Stories are anonymous by default. We don't sell data. We don't share submissions outside Unbound. Ever.",
  },
  {
    icon: Users,
    title: "We don't replace anything.",
    body: "We are not lawyers, judges, evaluators, or licensed therapists. We are a softer doorway to the help you actually need.",
  },
];

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-20 md:py-28">
        <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#9C3D22]">
          About Unbound
        </p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight mt-6 leading-[0.98]">
          We were built because the family court system was not built for people. It was built for
          <span className="text-[#9C3D22]"> case management.</span>
        </h1>
        <p className="text-lg text-[#5C5651] mt-10 leading-relaxed max-w-3xl">
          Unbound began as a list of phone numbers passed between parents who
          had survived the same broken process. Court-ordered counselling.
          Custody evaluations that read like character assassinations.
          Mandates that treated symptoms and ignored harm. We grew into a
          platform — but the original list is still the spine: people, helping
          people, through a system that pretends to be neutral.
        </p>
      </section>

      <section
        className="relative bg-[#1F1A17] text-[#F9F7F3] overflow-hidden"
        data-testid="about-tenets"
      >
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url(${TEXTURE})` }}
        />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#E27A4D]">
            Our tenets
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold mt-4 max-w-3xl leading-tight">
            Four rules we won't bend, even when it would be easier to.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {TENETS.map(({ icon: Icon, title, body }, i) => (
              <div
                key={i}
                className="border border-white/15 rounded-2xl p-8 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                data-testid={`tenet-${i}`}
              >
                <Icon size={26} className="text-[#E27A4D]" />
                <h3 className="font-display text-2xl font-semibold mt-5">{title}</h3>
                <p className="text-[#F9F7F3]/75 mt-3 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
              If you found us, you already know. The hardest part isn't the ruling — it's the silence after.
            </h2>
            <p className="text-[#5C5651] mt-6 leading-relaxed">
              Reach out. Read a story. Book a counsellor. Or just sit with
              Anchor for a while. You won't be hurried, and you won't be alone.
            </p>
          </div>
          <div className="md:col-span-5 flex flex-col gap-3">
            <Link
              to="/counselors"
              className="bg-[#9C3D22] hover:bg-[#7A2E19] text-white rounded-full px-6 py-3.5 font-medium transition-colors inline-flex items-center justify-center gap-2"
              data-testid="about-cta-counsellors"
            >
              Find a counsellor <ArrowUpRight size={16} />
            </Link>
            <Link
              to="/chat"
              className="border border-[#1F1A17] text-[#1F1A17] hover:bg-[#F1EFEB] rounded-full px-6 py-3.5 font-medium transition-colors inline-flex items-center justify-center gap-2"
              data-testid="about-cta-chat"
            >
              Talk to Anchor
            </Link>
            <Link
              to="/contact"
              className="border border-[#1F1A17]/30 text-[#1F1A17] hover:bg-[#F1EFEB] rounded-full px-6 py-3.5 font-medium transition-colors inline-flex items-center justify-center gap-2"
              data-testid="about-cta-contact"
            >
              Write to us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
