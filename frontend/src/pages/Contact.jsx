import { useState } from "react";
import { submitContact } from "../lib/api";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Send, Mail, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Name, email and message are required.");
      return;
    }
    setSubmitting(true);
    try {
      await submitContact(form);
      toast.success("Message received. We'll respond within 2 business days.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Couldn't send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20" data-testid="contact-page">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#9C3D22]">
            Reach us
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight mt-4 leading-[1.02]">
            We answer — even the messages that come in pieces.
          </h1>
          <p className="text-[#5C5651] mt-6 leading-relaxed max-w-md">
            For counsellor partnerships, story moderation appeals, or just to
            say "this happened to me too" — write to us. A real human reads
            every message.
          </p>

          <div className="mt-12 space-y-6">
            <ContactBit icon={Mail} label="Email" value="hello@unbound.care" />
            <ContactBit icon={MessageCircle} label="Crisis line (US)" value="988 — Suicide & Crisis Lifeline" />
            <ContactBit icon={MapPin} label="Operating" value="Remote · United States" />
          </div>
        </div>

        <form
          onSubmit={submit}
          className="lg:col-span-7 bg-white border border-[#E5E1D8] rounded-2xl p-8 md:p-10 space-y-5"
          data-testid="contact-form"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 bg-[#F9F7F3] border-[#E5E1D8]"
                data-testid="contact-name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 bg-[#F9F7F3] border-[#E5E1D8]"
                data-testid="contact-email"
              />
            </div>
          </div>
          <div>
            <Label>Subject</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="What is this about?"
              className="mt-1.5 bg-[#F9F7F3] border-[#E5E1D8]"
              data-testid="contact-subject"
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              rows={7}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Say as much as you need to. We're listening."
              className="mt-1.5 bg-[#F9F7F3] border-[#E5E1D8]"
              data-testid="contact-message"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-[#9C3D22] hover:bg-[#7A2E19] disabled:opacity-60 text-white rounded-full px-6 py-3 font-medium transition-colors"
            data-testid="contact-submit-btn"
          >
            {submitting ? "Sending…" : <>Send message <Send size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

function ContactBit({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-full bg-[#F1EFEB] flex items-center justify-center text-[#9C3D22]">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-[#5C5651] font-semibold">
          {label}
        </p>
        <p className="font-display text-lg mt-1">{value}</p>
      </div>
    </div>
  );
}
