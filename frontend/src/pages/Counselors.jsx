import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCounselors, createBooking } from "../lib/api";
import { Search, Filter, X, Star, MapPin, Languages, ArrowUpRight } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { toast } from "sonner";

const ALL_SPECIALTIES = [
  "All",
  "Parental Alienation",
  "Mandated Counselling",
  "Co-parenting",
  "Children of Divorce",
  "Custody Evaluations",
  "Reunification",
  "Litigation Stress",
];

const MODALITIES = ["All", "Virtual", "In-person"];

export default function Counselors() {
  const [counselors, setCounselors] = useState([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [modality, setModality] = useState("All");
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [params] = useSearchParams();

  useEffect(() => {
    getCounselors().then(setCounselors).catch(() => {});
  }, []);

  useEffect(() => {
    const focus = params.get("focus");
    if (focus && counselors.length) {
      const c = counselors.find((x) => x.id === focus);
      if (c) setSelected(c);
    }
  }, [params, counselors]);

  const filtered = useMemo(() => {
    return counselors.filter((c) => {
      if (acceptingOnly && !c.accepting_new) return false;
      if (modality !== "All" && !c.modalities.includes(modality)) return false;
      if (
        specialty !== "All" &&
        !c.specialties.some((s) =>
          s.toLowerCase().includes(specialty.toLowerCase())
        )
      )
        return false;
      if (
        search &&
        !`${c.name} ${c.bio} ${c.specialties.join(" ")} ${c.location}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [counselors, search, specialty, modality, acceptingOnly]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20" data-testid="counselors-page">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-12">
        <div className="lg:col-span-7">
          <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#9C3D22]">
            The Directory
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight mt-4 leading-[1.02]">
            Counsellors who specialise in what the court created.
          </h1>
        </div>
        <p className="lg:col-span-5 text-[#5C5651] leading-relaxed">
          Every therapist on Unbound has direct experience with court-ordered
          counselling, custody trauma, and the strange grief of mandated
          repair. Filter, read, and reach out when you're ready.
        </p>
      </div>

      {/* Filters */}
      <div
        className="bg-white border border-[#E5E1D8] rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        data-testid="counselors-filters"
      >
        <div className="md:col-span-4">
          <Label className="text-xs uppercase tracking-[0.18em] text-[#5C5651]">
            Search
          </Label>
          <div className="relative mt-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5651]" />
            <Input
              data-testid="counselors-search-input"
              placeholder="Name, location, or specialty"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#F9F7F3] border-[#E5E1D8]"
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <Label className="text-xs uppercase tracking-[0.18em] text-[#5C5651]">
            Specialty
          </Label>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger
              className="mt-2 bg-[#F9F7F3] border-[#E5E1D8]"
              data-testid="counselors-specialty-trigger"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_SPECIALTIES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs uppercase tracking-[0.18em] text-[#5C5651]">
            Modality
          </Label>
          <Select value={modality} onValueChange={setModality}>
            <SelectTrigger
              className="mt-2 bg-[#F9F7F3] border-[#E5E1D8]"
              data-testid="counselors-modality-trigger"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODALITIES.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3 flex items-center gap-2 pt-2 md:pt-0">
          <Checkbox
            id="accepting"
            checked={acceptingOnly}
            onCheckedChange={(v) => setAcceptingOnly(Boolean(v))}
            data-testid="counselors-accepting-checkbox"
          />
          <Label htmlFor="accepting" className="text-sm cursor-pointer">
            Accepting new clients only
          </Label>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-[#5C5651] mt-6 mb-4" data-testid="counselors-result-count">
        Showing {filtered.length} {filtered.length === 1 ? "counsellor" : "counsellors"}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <article
            key={c.id}
            className="group bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col"
            data-testid={`counselor-card-${c.id}`}
          >
            <div className="aspect-[5/4] overflow-hidden bg-[#F1EFEB]">
              <img
                src={c.image_url}
                alt={c.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.18em] uppercase text-[#5A7059] font-semibold">
                    {c.title}
                  </p>
                  <h3 className="font-display text-2xl font-semibold mt-1.5 leading-tight">
                    {c.name}
                  </h3>
                  <p className="text-xs text-[#5C5651] mt-1">{c.credentials}</p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star size={14} className="fill-[#9C3D22] text-[#9C3D22]" />
                  <span className="font-medium">{c.rating}</span>
                </div>
              </div>
              <p className="text-sm text-[#5C5651] mt-4 line-clamp-3 flex-1">{c.bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {c.specialties.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#F1EFEB] text-[#1F1A17]"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 mt-5 pt-5 border-t border-[#E5E1D8]">
                <div className="text-xs text-[#5C5651] flex items-center gap-1.5">
                  <MapPin size={13} /> {c.location}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.accepting_new
                      ? "bg-[#5A7059]/15 text-[#465845]"
                      : "bg-[#E5E1D8] text-[#5C5651]"
                  }`}
                >
                  {c.accepting_new ? "Accepting" : "Waitlist"}
                </span>
              </div>
              <button
                onClick={() => setSelected(c)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[#9C3D22] hover:bg-[#7A2E19] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
                data-testid={`counselor-book-btn-${c.id}`}
              >
                Book consultation <ArrowUpRight size={15} />
              </button>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-[#5C5651]" data-testid="counselors-empty">
            <Filter size={28} className="mx-auto mb-3 opacity-40" />
            <p>No counsellors match those filters. Try widening your search.</p>
          </div>
        )}
      </div>

      <BookingDialog
        counselor={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function BookingDialog({ counselor, onClose }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    preferred_date: "",
    case_stage: "",
    children_involved: false,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!counselor) return null;

  const handle = (k) => (e) =>
    setForm((p) => ({
      ...p,
      [k]: e?.target ? e.target.value : e,
    }));

  const submit = async () => {
    if (!form.full_name || !form.email || !form.preferred_date) {
      toast.error("Please fill name, email and preferred date.");
      return;
    }
    setSubmitting(true);
    try {
      await createBooking({ counselor_id: counselor.id, ...form });
      toast.success("Request sent. The counsellor will reach out within 48 hours.");
      onClose();
      setForm({
        full_name: "",
        email: "",
        phone: "",
        preferred_date: "",
        case_stage: "",
        children_involved: false,
        message: "",
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(counselor)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl bg-[#F9F7F3] border-[#E5E1D8]" data-testid="booking-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Book with {counselor.name}
          </DialogTitle>
          <DialogDescription className="text-[#5C5651]">
            {counselor.title} · {counselor.location} · {counselor.rate}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <Label>Full name</Label>
            <Input
              value={form.full_name}
              onChange={handle("full_name")}
              className="mt-1.5 bg-white border-[#E5E1D8]"
              data-testid="booking-full-name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={handle("email")}
              className="mt-1.5 bg-white border-[#E5E1D8]"
              data-testid="booking-email"
            />
          </div>
          <div>
            <Label>Phone (optional)</Label>
            <Input
              value={form.phone}
              onChange={handle("phone")}
              className="mt-1.5 bg-white border-[#E5E1D8]"
              data-testid="booking-phone"
            />
          </div>
          <div>
            <Label>Preferred date</Label>
            <Input
              type="date"
              value={form.preferred_date}
              onChange={handle("preferred_date")}
              className="mt-1.5 bg-white border-[#E5E1D8]"
              data-testid="booking-date"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Where are you in the process?</Label>
            <Select value={form.case_stage} onValueChange={handle("case_stage")}>
              <SelectTrigger
                className="mt-1.5 bg-white border-[#E5E1D8]"
                data-testid="booking-stage-trigger"
              >
                <SelectValue placeholder="Choose a stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="considering">Considering filing</SelectItem>
                <SelectItem value="active">Active case</SelectItem>
                <SelectItem value="mandate">Court-ordered counselling</SelectItem>
                <SelectItem value="post">Post-judgment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <Checkbox
              id="kids"
              checked={form.children_involved}
              onCheckedChange={(v) =>
                setForm((p) => ({ ...p, children_involved: Boolean(v) }))
              }
              data-testid="booking-kids-checkbox"
            />
            <Label htmlFor="kids" className="cursor-pointer">
              Children are involved in this matter
            </Label>
          </div>
          <div className="md:col-span-2">
            <Label>Anything else the counsellor should know?</Label>
            <Textarea
              rows={4}
              value={form.message}
              onChange={handle("message")}
              className="mt-1.5 bg-white border-[#E5E1D8]"
              placeholder="Optional — share as much or as little as you want."
              data-testid="booking-message"
            />
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <button
            onClick={onClose}
            className="border border-[#1F1A17]/30 hover:bg-[#F1EFEB] text-[#1F1A17] rounded-full px-5 py-2.5 text-sm font-medium transition"
            data-testid="booking-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="bg-[#9C3D22] hover:bg-[#7A2E19] disabled:opacity-60 text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
            data-testid="booking-submit-btn"
          >
            {submitting ? "Sending…" : "Send request"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
