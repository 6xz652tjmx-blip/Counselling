import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { sendChat, API } from "../lib/api";
import {
  Send,
  MessageCircle,
  Sparkles,
  FileText,
  MapPin,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const STARTERS_DEFAULT = [
  "My court-ordered counsellor's report feels unfair. How do I deal with this?",
  "My child is exhausted by the custody schedule. What can I do tonight?",
  "I'm burning out from years of litigation. Help me find one step.",
  "How do I document something without spiraling?",
];

const STARTERS_FOR_ORDER = [
  "Walk me through the most urgent deadline in this order.",
  "What questions should I ask my attorney about this?",
  "How do I explain this order to my child without scaring them?",
  "Which obligation should I tackle first this week?",
];

export default function Chat() {
  const [params, setParams] = useSearchParams();
  const orderId = params.get("order");
  const initialJurisdiction = params.get("jurisdiction") || "";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState(null);
  const [jurisdiction, setJurisdiction] = useState(initialJurisdiction);
  const [jurisdictions, setJurisdictions] = useState([]);
  const scrollerRef = useRef(null);

  // Load jurisdictions list
  useEffect(() => {
    axios
      .get(`${API}/jurisdictions`)
      .then((r) => setJurisdictions(r.data))
      .catch(() => {});
  }, []);

  // Load order context if linked
  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }
    axios
      .get(`${API}/orders/${orderId}`)
      .then((r) => {
        setOrder(r.data);
        if (r.data?.jurisdiction && !jurisdiction) {
          setJurisdiction(r.data.jurisdiction);
        }
      })
      .catch(() => setOrder(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Greeting changes based on context
  useEffect(() => {
    const greeting = order
      ? {
          role: "assistant",
          content: `I've read your "${
            order.analysis?.document_type || "court document"
          }" — ${
            order.filename
          }. I can answer questions about the obligations, deadlines, or the emotional weight of it. What's the first thing you want to talk about?`,
        }
      : {
          role: "assistant",
          content:
            "I'm Anchor. I sit with people moving through family court — the unfair, the heavy, the exhausting parts. Tell me what's on your mind tonight. I'm not a lawyer or your therapist, but I'll stay with you while we name what's happening.",
        };
    setMessages([greeting]);
    setSessionId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, order?.id]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const clearOrder = () => {
    const next = new URLSearchParams(params);
    next.delete("order");
    setParams(next, { replace: true });
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    setSending(true);
    try {
      const res = await sendChat({
        session_id: sessionId,
        message: msg,
        order_id: orderId || null,
        jurisdiction: jurisdiction || null,
      });
      setSessionId(res.session_id);
      setMessages((p) => [...p, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content:
            "I couldn't reach my words right now. Try once more — and if it keeps failing, please use the Contact form so we can help.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const starters = order ? STARTERS_FOR_ORDER : STARTERS_DEFAULT;

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-20" data-testid="chat-page">
      <div className="mb-10">
        <p className="overline text-xs tracking-[0.25em] uppercase font-bold text-[#9C3D22]">
          Anchor — your private guide
        </p>
        <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight mt-4 leading-[1.02]">
          A quiet place to think out loud.
        </h1>
        <p className="text-[#5C5651] mt-5 max-w-2xl leading-relaxed">
          Anchor is an AI guide for family court trauma. Free. Private.
          Validating. It won't pretend the system is fair, and it won't replace
          a counsellor — but it'll meet you where the night is loud.
        </p>
      </div>

      {/* Context banner: linked order */}
      {order && (
        <div
          className="bg-[#5A7059]/10 border border-[#5A7059]/30 rounded-2xl p-5 mb-5 flex items-start justify-between gap-4"
          data-testid="chat-order-context-banner"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#5A7059] text-white flex items-center justify-center flex-shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-[#465845] font-semibold">
                Anchor is using this document as context
              </p>
              <p className="font-display text-lg font-semibold truncate mt-0.5" data-testid="chat-order-filename">
                {order.analysis?.document_type || "Court document"} · {order.filename}
              </p>
              {order.jurisdiction_name && (
                <p className="text-xs text-[#465845] mt-0.5 inline-flex items-center gap-1">
                  <MapPin size={11} /> {order.jurisdiction_name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={clearOrder}
            className="p-1.5 rounded-full hover:bg-[#5A7059]/15 text-[#465845] flex-shrink-0"
            aria-label="Remove order context"
            data-testid="chat-clear-order"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Jurisdiction selector */}
      <div
        className="bg-white border border-[#E5E1D8] rounded-2xl p-5 mb-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
        data-testid="chat-jurisdiction-row"
      >
        <div className="flex items-center gap-2 text-sm text-[#1F1A17] font-medium">
          <MapPin size={15} className="text-[#9C3D22]" />
          Tune Anchor to your jurisdiction
        </div>
        <div className="flex-1 max-w-sm">
          <Select value={jurisdiction} onValueChange={setJurisdiction}>
            <SelectTrigger
              className="bg-[#F9F7F3] border-[#E5E1D8]"
              data-testid="chat-jurisdiction-trigger"
            >
              <SelectValue placeholder="Optional — pick your state" />
            </SelectTrigger>
            <SelectContent>
              {jurisdictions.map((j) => (
                <SelectItem
                  key={j.code}
                  value={j.code}
                  data-testid={`chat-jurisdiction-${j.code}`}
                >
                  {j.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!order && (
          <Link
            to="/decipher"
            className="text-xs text-[#5A7059] hover:text-[#465845] font-semibold uppercase tracking-wider"
            data-testid="chat-decipher-link"
          >
            Upload an order →
          </Link>
        )}
      </div>

      <div className="bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden flex flex-col h-[640px]">
        <div className="bg-[#5A7059] text-white px-6 py-4 flex items-center gap-3" data-testid="chat-header">
          <Sparkles size={18} />
          <div>
            <p className="font-semibold">Anchor</p>
            <p className="text-xs text-white/70">
              Compassionate guidance · Not legal/clinical advice
              {jurisdiction ? ` · ${jurisdiction}` : ""}
            </p>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-5 bg-[#F9F7F3]"
          data-testid="chat-stream"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              data-testid={`chat-msg-${m.role}-${i}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 leading-relaxed text-[15px] whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-[#1F1A17] text-[#F9F7F3] rounded-br-md"
                    : "bg-white border border-[#E5E1D8] text-[#1F1A17] rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start" data-testid="chat-typing">
              <div className="bg-white border border-[#E5E1D8] rounded-2xl rounded-bl-md px-5 py-3.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#9C3D22] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#9C3D22] animate-pulse [animation-delay:200ms]" />
                <span className="w-2 h-2 rounded-full bg-[#9C3D22] animate-pulse [animation-delay:400ms]" />
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="px-5 md:px-8 pb-3 flex flex-wrap gap-2" data-testid="chat-starters">
            {starters.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs md:text-sm px-3.5 py-2 rounded-full border border-[#E5E1D8] bg-white hover:bg-[#F1EFEB] transition-colors text-[#1F1A17]"
                data-testid={`chat-starter-${s.slice(0, 12).toLowerCase().replace(/\W+/g, "-")}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-[#E5E1D8] bg-white p-4 flex items-end gap-3"
          data-testid="chat-form"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={
              order
                ? "Ask about a deadline, obligation, or feeling…"
                : "Tell Anchor what's heavy tonight…"
            }
            className="flex-1 resize-none bg-[#F9F7F3] border border-[#E5E1D8] rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#9C3D22]/30 max-h-40"
            data-testid="chat-input"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-[#9C3D22] hover:bg-[#7A2E19] disabled:opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Send"
            data-testid="chat-send-btn"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <div className="mt-6 text-xs text-[#5C5651] flex items-center gap-2" data-testid="chat-disclaimer">
        <MessageCircle size={14} />
        Anchor is an AI tool and not a substitute for licensed mental health
        care or legal advice. In crisis, call 988 (US) or your local emergency line.
      </div>
    </div>
  );
}
