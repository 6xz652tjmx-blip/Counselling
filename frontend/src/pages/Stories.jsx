import { useEffect, useState } from "react";
import { getStories, submitStory, likeStory } from "../lib/api";
import { Quote, Heart, Send } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState({
    pen_name: "",
    title: "",
    body: "",
    state: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = () => getStories().then(setStories).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const handleLike = async (id) => {
    try {
      const res = await likeStory(id);
      setStories((prev) =>
        prev.map((s) => (s.id === id ? { ...s, likes: res.likes } : s))
      );
    } catch {
      // ignore
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) {
      toast.error("A title and your story are required.");
      return;
    }
    setSubmitting(true);
    try {
      await submitStory({
        pen_name: form.pen_name || "Anonymous",
        title: form.title,
        body: form.body,
        state: form.state || null,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      });
      toast.success("Story received. It will appear after our moderation review.");
      setForm({ pen_name: "", title: "", body: "", state: "", tags: "" });
    } catch {
      toast.error("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20" data-testid="stories-page">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-12">
        <div className="lg:col-span-7">
          <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#9C3D22]">
            The Stories Archive
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight mt-4 leading-[1.02]">
            The accounts the court transcript skipped.
          </h1>
        </div>
        <p className="lg:col-span-5 text-[#5C5651] leading-relaxed">
          Submissions are anonymous unless you choose otherwise. Every story is
          reviewed for safety before it's published — and we never edit your
          voice to make the system look kinder than it was.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          {stories.map((s, i) => (
            <article
              key={s.id}
              className="bg-white border border-[#E5E1D8] rounded-2xl p-7 md:p-10"
              data-testid={`story-card-${s.id}`}
            >
              <Quote size={26} className="text-[#9C3D22]" />
              <h2 className="font-display text-2xl md:text-3xl font-semibold mt-4 leading-snug">
                {s.title}
              </h2>
              <p className="text-[#5C5651] mt-4 leading-relaxed whitespace-pre-line">
                {s.body}
              </p>
              <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs tracking-[0.18em] uppercase text-[#5A7059] font-semibold">
                  — {s.pen_name} {s.state ? `· ${s.state}` : ""}
                </p>
                <button
                  onClick={() => handleLike(s.id)}
                  className="inline-flex items-center gap-2 text-sm text-[#1F1A17] hover:text-[#9C3D22] transition-colors"
                  data-testid={`story-like-${s.id}`}
                >
                  <Heart size={16} /> {s.likes ?? 0}
                </button>
              </div>
            </article>
          ))}
          {stories.length === 0 && (
            <p className="text-[#5C5651]" data-testid="stories-empty">
              No stories yet. Be the first to break the silence.
            </p>
          )}
        </div>

        <aside
          className="lg:col-span-5 lg:sticky lg:top-24 self-start bg-[#1F1A17] text-[#F9F7F3] rounded-2xl p-8 md:p-10"
          id="share"
          data-testid="story-form"
        >
          <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#E27A4D]">
            Share your story
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold mt-3 leading-tight">
            Say the part the courtroom wouldn't let you finish.
          </h2>
          <p className="text-sm text-[#F9F7F3]/70 mt-3">
            Anonymous by default. Reviewed by a human before publishing.
          </p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <Label className="text-[#F9F7F3]/80">Pen name (optional)</Label>
              <Input
                value={form.pen_name}
                onChange={(e) => setForm({ ...form, pen_name: e.target.value })}
                placeholder="Anonymous"
                className="mt-1.5 bg-[#2A2421] border-white/10 text-[#F9F7F3] placeholder:text-[#F9F7F3]/40"
                data-testid="story-pen-name"
              />
            </div>
            <div>
              <Label className="text-[#F9F7F3]/80">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. The day the judge stopped listening"
                className="mt-1.5 bg-[#2A2421] border-white/10 text-[#F9F7F3] placeholder:text-[#F9F7F3]/40"
                data-testid="story-title"
              />
            </div>
            <div>
              <Label className="text-[#F9F7F3]/80">Your story</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={6}
                placeholder="Take your time. Say what happened. Say what hurt."
                className="mt-1.5 bg-[#2A2421] border-white/10 text-[#F9F7F3] placeholder:text-[#F9F7F3]/40"
                data-testid="story-body"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[#F9F7F3]/80">State (optional)</Label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="e.g. CA"
                  className="mt-1.5 bg-[#2A2421] border-white/10 text-[#F9F7F3] placeholder:text-[#F9F7F3]/40"
                  data-testid="story-state"
                />
              </div>
              <div>
                <Label className="text-[#F9F7F3]/80">Tags (comma sep.)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="mandate, custody"
                  className="mt-1.5 bg-[#2A2421] border-white/10 text-[#F9F7F3] placeholder:text-[#F9F7F3]/40"
                  data-testid="story-tags"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-[#9C3D22] hover:bg-[#7A2E19] disabled:opacity-60 text-white rounded-full px-6 py-3 font-medium transition-colors"
              data-testid="story-submit-btn"
            >
              {submitting ? "Sending…" : <>Submit story <Send size={16} /></>}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
