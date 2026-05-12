# Unbound — Family Court Counselling Platform

## Original Problem Statement
> Build me a website for family court ordered counselling. To be focused on the emotional damage and stress family courts create. The hardships and struggles the unfair and biased system has. The unjust rulings and mandates. The harms and struggles it creates on kids.

## User Choices (gathered 2025-12)
- Purpose: Full platform — Counsellor directory + booking, support community/stories, AI guidance
- Contact form: Simple
- AI chatbot: Claude Sonnet 4.5 via Emergent LLM key
- Design tone: Blend of advocacy-driven, warm-healing, and calm-professional

## Architecture
- Backend: FastAPI (Python) at `/app/backend/server.py`, all routes prefixed `/api`
- Database: MongoDB (motor async). Collections: `counselors`, `stories`, `resources`, `bookings`, `contacts`, `chat_messages`
- Frontend: React (CRA + craco) + Tailwind + shadcn UI + lucide-react + sonner toasts
- AI: `emergentintegrations.llm.chat` → `anthropic / claude-sonnet-4-5-20250929` via `EMERGENT_LLM_KEY`
- Fonts: Clash Display (display) + Manrope (body) loaded via Fontshare + Google Fonts CDN
- Color tokens: warm sand `#F9F7F3`, terracotta `#9C3D22`, sage `#5A7059`, ink `#1F1A17`

## Personas
1. Parent inside an active family-court case looking for trauma-aware counselling.
2. Parent under a court-ordered counselling mandate seeking guidance.
3. Survivor wanting to share or read anonymous stories.
4. Researcher/advocate browsing systemic-harm resources.

## Implemented (v1 — 2025-12)
- Home page with hero, stats, advocacy marquee, mission bento, counsellor previews, stories preview, AI CTA band
- Counsellors directory (`/counselors`) with search + specialty/modality/accepting filters + booking dialog (form → POST /api/bookings)
- Stories (`/stories`) — list approved stories, like endpoint, anonymous submission with moderation queue
- Resources (`/resources`) — 6 seeded articles with category filter
- Anchor chat (`/chat`) — live Claude Sonnet 4.5 with session continuity + persisted history
- Contact (`/contact`) — simple intake form
- About (`/about`) — mission + four tenets
- Navbar (desktop + mobile menu), Footer with crisis line
- Idempotent seed of 6 counsellors, 4 approved stories, 6 resources on startup
- 100% backend test pass (17/17), all frontend flows verified via testing_agent_v3

## Backlog
### P0 — pre-launch
- Replace stock images with platform-owned or illustrated portraits
- Email notifications on bookings/contact (Resend or SendGrid)
- Rate-limit / honeypot on public POST endpoints (`/contact`, `/stories`, `/bookings`)

### P1
- Counsellor detail page (dedicated route) with reviews
- Resource detail pages (actual article body)
- Admin moderation dashboard for pending stories
- Donation / paid sponsorship tier for sustainability

### P2
- Newsletter signup + drip series for parents under mandate
- State-specific resource matrix
- Multi-language (Spanish first)

## Next Action Items
1. Add transactional email on bookings/contact.
2. Build admin moderation dashboard.
3. Add SEO meta tags and OG image per route.
