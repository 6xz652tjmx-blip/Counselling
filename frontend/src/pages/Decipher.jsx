import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Heart,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { API } from "../lib/api";

const ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif,.txt,application/pdf,image/png,image/jpeg,image/webp,image/heic,image/heif,text/plain";

export default function Decipher() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const choose = (f) => {
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) {
      toast.error("File too large. Max 15 MB.");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) choose(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setNotes("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async () => {
    if (!file) {
      toast.error("Please choose a file first.");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (notes.trim()) fd.append("notes", notes.trim());
      const res = await axios.post(`${API}/orders/analyze`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      setResult(res.data);
      toast.success("Decipher finished reading your document.");
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        "We couldn't analyse that file. Try a clearer copy or a PDF.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20" data-testid="decipher-page">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-12">
        <div className="lg:col-span-7">
          <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#9C3D22]">
            Decipher — your court-document translator
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight mt-4 leading-[1.02]">
            Upload the order. We'll read it in plain language.
          </h1>
        </div>
        <p className="lg:col-span-5 text-[#5C5651] leading-relaxed">
          Court orders are written for lawyers, not parents. Decipher uses AI
          to translate the document, flag deadlines, and recommend grounded
          next steps. We are not your attorney — but we'll help you walk into
          their office knowing what to ask.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT: upload */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`relative bg-white border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
              dragOver ? "border-[#9C3D22] bg-[#FBF4F0]" : "border-[#E5E1D8]"
            }`}
            data-testid="decipher-dropzone"
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => choose(e.target.files?.[0])}
              data-testid="decipher-file-input"
            />
            {!file ? (
              <>
                <div className="mx-auto w-14 h-14 rounded-full bg-[#F1EFEB] flex items-center justify-center text-[#9C3D22]">
                  <UploadCloud size={26} />
                </div>
                <h3 className="font-display text-2xl font-semibold mt-5">
                  Drop the order here
                </h3>
                <p className="text-sm text-[#5C5651] mt-2 leading-relaxed">
                  PDF, image, or text. Up to 15 MB. We process the document,
                  return the analysis, and discard the file.
                </p>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="mt-6 inline-flex items-center gap-2 bg-[#1F1A17] hover:bg-black text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
                  data-testid="decipher-choose-file"
                >
                  Choose a file
                </button>
              </>
            ) : (
              <div className="text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F1EFEB] flex items-center justify-center text-[#9C3D22] flex-shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-medium truncate"
                        data-testid="decipher-file-name"
                      >
                        {file.name}
                      </p>
                      <p className="text-xs text-[#5C5651] mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB · {file.type || "unknown"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={reset}
                    className="p-1.5 rounded-full hover:bg-[#F1EFEB] text-[#5C5651]"
                    aria-label="Remove file"
                    data-testid="decipher-remove-file"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs uppercase tracking-[0.18em] text-[#5C5651]">
              Anything Decipher should know? (optional)
            </Label>
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. This is a temporary order from a custody hearing last week."
              className="mt-2 bg-white border-[#E5E1D8]"
              data-testid="decipher-notes"
            />
          </div>

          <button
            onClick={submit}
            disabled={busy || !file}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#9C3D22] hover:bg-[#7A2E19] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-full px-6 py-3.5 font-medium transition-colors"
            data-testid="decipher-submit-btn"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Reading carefully…
              </>
            ) : (
              <>
                <Sparkles size={16} /> Decipher this document
              </>
            )}
          </button>

          <div className="bg-[#F1EFEB] border border-[#E5E1D8] rounded-2xl p-5 text-xs text-[#5C5651] leading-relaxed">
            <p className="flex items-center gap-2 text-[#1F1A17] font-semibold mb-2">
              <ShieldCheck size={14} className="text-[#5A7059]" /> What happens to your file
            </p>
            We send the document to a secure AI provider, receive the
            analysis, and store only the analysis (not the original). This is
            educational, not legal advice. Always confirm with your attorney.
          </div>
        </div>

        {/* RIGHT: result */}
        <div className="lg:col-span-7" data-testid="decipher-result-pane">
          {!result && !busy && <PlaceholderState />}
          {busy && <LoadingState />}
          {result && <ResultView result={result} />}
        </div>
      </div>
    </div>
  );
}

function PlaceholderState() {
  return (
    <div
      className="bg-white border border-[#E5E1D8] rounded-2xl p-10 text-center"
      data-testid="decipher-placeholder"
    >
      <div className="mx-auto w-14 h-14 rounded-full bg-[#F1EFEB] flex items-center justify-center text-[#5A7059]">
        <FileText size={26} />
      </div>
      <h3 className="font-display text-2xl font-semibold mt-5">
        Your decoded order will appear here
      </h3>
      <p className="text-sm text-[#5C5651] mt-3 max-w-md mx-auto leading-relaxed">
        Upload a court order on the left and Decipher will return a
        plain-language summary, the obligations, deadlines, things to flag
        with your attorney, and concrete next steps.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="bg-white border border-[#E5E1D8] rounded-2xl p-10 text-center"
      data-testid="decipher-loading"
    >
      <Loader2 size={28} className="mx-auto animate-spin text-[#9C3D22]" />
      <h3 className="font-display text-xl font-semibold mt-5">
        Reading your document with care
      </h3>
      <p className="text-sm text-[#5C5651] mt-2 max-w-sm mx-auto">
        Court orders are dense. This usually takes 20–60 seconds.
      </p>
    </div>
  );
}

function Section({ icon: Icon, label, children, testId, tone = "default" }) {
  const toneCls =
    tone === "warn"
      ? "text-[#9C3D22]"
      : tone === "ok"
      ? "text-[#5A7059]"
      : "text-[#1F1A17]";
  return (
    <section
      className="bg-white border border-[#E5E1D8] rounded-2xl p-7"
      data-testid={testId}
    >
      <h3 className={`flex items-center gap-2 font-display text-lg font-semibold ${toneCls}`}>
        <Icon size={18} /> {label}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ResultView({ result }) {
  const a = result.analysis || {};
  const has = (v) =>
    v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : `${v}`.trim() !== "");

  return (
    <div className="space-y-6" data-testid="decipher-result">
      <div className="bg-[#1F1A17] text-[#F9F7F3] rounded-2xl p-8 md:p-9 relative overflow-hidden">
        <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#E27A4D]">
          {a.document_type || "Court Document"}
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold mt-3 leading-tight">
          {a.summary || "No summary returned."}
        </h2>
        {has(a.tone_note) && (
          <p className="mt-5 text-sm text-[#F9F7F3]/75 italic border-l-2 border-[#E27A4D] pl-4 max-w-prose">
            {a.tone_note}
          </p>
        )}
        <p className="mt-6 text-xs text-[#F9F7F3]/50">
          File: {result.filename}
        </p>
      </div>

      {has(a.emotional_grounding) && (
        <Section
          icon={Heart}
          label="A grounded breath first"
          testId="decipher-emotional"
          tone="ok"
        >
          <p className="text-[#5C5651] leading-relaxed">{a.emotional_grounding}</p>
        </Section>
      )}

      {has(a.key_obligations) && (
        <Section
          icon={CheckCircle2}
          label="What the order requires"
          testId="decipher-obligations"
        >
          <ul className="space-y-3">
            {a.key_obligations.map((o, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border-l-2 border-[#9C3D22] pl-4"
                data-testid={`decipher-obligation-${i}`}
              >
                <div>
                  <p className="font-medium text-[#1F1A17]">{o.item}</p>
                  <p className="text-xs text-[#5C5651] mt-1">
                    {o.responsible_party
                      ? `Responsible: ${o.responsible_party}`
                      : ""}
                    {o.responsible_party && o.due ? " · " : ""}
                    {o.due ? `Due: ${o.due}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {has(a.deadlines) && (
        <Section
          icon={Clock}
          label="Deadlines & windows"
          testId="decipher-deadlines"
        >
          <ul className="space-y-2">
            {a.deadlines.map((d, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm"
                data-testid={`decipher-deadline-${i}`}
              >
                <span className="text-[#9C3D22] font-mono text-xs mt-0.5 flex-shrink-0">
                  {d.date_or_window || "TBD"}
                </span>
                <span className="text-[#1F1A17]">{d.what}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {has(a.things_to_watch) && (
        <Section
          icon={AlertTriangle}
          label="Things to watch"
          testId="decipher-watch"
          tone="warn"
        >
          <ul className="space-y-2">
            {a.things_to_watch.map((t, i) => (
              <li
                key={i}
                className="text-[#5C5651] text-sm leading-relaxed before:content-['•'] before:text-[#9C3D22] before:mr-2 before:font-bold"
                data-testid={`decipher-watch-${i}`}
              >
                {t}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {has(a.next_steps) && (
        <Section
          icon={ArrowUpRight}
          label="Next steps you can take this week"
          testId="decipher-next-steps"
        >
          <ol className="space-y-3">
            {a.next_steps.map((s, i) => (
              <li
                key={i}
                className="border border-[#E5E1D8] rounded-xl p-4 bg-[#F9F7F3]"
                data-testid={`decipher-next-step-${i}`}
              >
                <p className="font-medium text-[#1F1A17]">
                  {i + 1}. {s.step}
                </p>
                {s.why_it_matters && (
                  <p className="text-xs text-[#5C5651] mt-1.5 leading-relaxed">
                    {s.why_it_matters}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {has(a.questions_for_your_attorney) && (
        <Section
          icon={HelpCircle}
          label="Ask your attorney"
          testId="decipher-questions"
        >
          <ul className="space-y-2">
            {a.questions_for_your_attorney.map((q, i) => (
              <li
                key={i}
                className="text-sm text-[#1F1A17] leading-relaxed before:content-['?'] before:text-[#5A7059] before:font-mono before:mr-2 before:font-bold"
                data-testid={`decipher-question-${i}`}
              >
                {q}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          to="/counselors"
          className="flex-1 bg-[#9C3D22] hover:bg-[#7A2E19] text-white rounded-full px-6 py-3.5 text-center font-medium transition-colors inline-flex items-center justify-center gap-2"
          data-testid="decipher-cta-counsellors"
        >
          Talk to a counsellor about this <ArrowUpRight size={16} />
        </Link>
        <Link
          to="/chat"
          className="flex-1 border border-[#1F1A17] text-[#1F1A17] hover:bg-[#F1EFEB] rounded-full px-6 py-3.5 text-center font-medium transition-colors"
          data-testid="decipher-cta-anchor"
        >
          Bring this to Anchor
        </Link>
      </div>

      <p className="text-xs text-[#5C5651] text-center" data-testid="decipher-disclaimer">
        Educational analysis only. Not legal advice. Always confirm with a
        licensed attorney in your jurisdiction.
      </p>
    </div>
  );
}
