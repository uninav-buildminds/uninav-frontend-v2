# UniNav Club Discovery

**Purpose**: Lightweight directory for club discovery—students find communities via a single clubs page. External registration links (WhatsApp/Google Forms) are tracked. No new auth; uses existing UniNav login. No-login browsing for discovery.

---

## Core Capabilities

- **Posting** (admins): Club name, description, image/banner, external link, tags/interests, targeting (public / specific depts / exclusions). Admins add and manage clubs.
- **Trackable redirects**: `uninav.live/clubs/[id]` → external URL; log clicks, dept (profile or IP), timestamps for analytics.
- **Clubs page**: One page at `/clubs` (or under dashboard). Cards styled like Material cards; users scroll to discover. Search supported. **Desktop**: click card → detail **modal**. **Mobile**: click card → detail **bottom drawer**. Same layout and styling as other app pages.
- **Request club**: If search/list is empty (or no results), show empty state with a “Request a club” CTA that opens a modal (desktop) or bottom drawer (mobile)—form: name, interest → submit to admins.
- **Promotion**: “Join related clubs?” on materials pages where relevant.
- **No new auth**: Uses existing UniNav login; no-login browsing for discovery.

**Roles**: Seekers (browse, search, request). Admins add clubs and handle requests. No separate organizer role or dashboard.

---

## Flows (condensed)

- **Seekers**: Open clubs page → scroll or search → click club card → detail in modal (desktop) or bottom drawer (mobile) → “Join Now” (tracked redirect). If nothing found, empty state → “Request a club” → modal/drawer → submit.
- **Admins**: Add clubs (name, description, link, targeting); handle request-club submissions.

---

## Pages & Modals

Integrate into existing dashboard/nav. Reuse materials-style layout and components (cards, modals, sheets). Add “Clubs” to nav.

### Shared

- **Clubs page** (`/clubs` or `/dashboard/clubs`): Single scrollable list of club **cards** (MaterialCard-style: image, name, short description). Search at top. **Desktop**: click card → **modal** with full details + “Join Now” (tracked). **Mobile**: click card → **bottom drawer** (Sheet) with same content. Empty state when no clubs or no search results: “Request a club” CTA → opens request form in modal (desktop) or bottom drawer (mobile).

### Admins

- **Admin clubs** (under existing management): List all clubs; search/filter; add new club; handle “request club” submissions. No flag review, no organizer dashboard.

---

## Out of scope (stripped)

- Separate auth for organizers/admins.
- In-app club membership or payments.
- Discovery feed with personalization, interest filters, or targeting visibility rules.
- User profile/onboarding “multiple interests” (dept → 5 interests).
- Email notifications for new matching clubs.
- User flagging and admin moderation (approve/hide).
- Organizer dashboard: post/edit/delete own clubs, click analytics, “My clubs” page, edit club modal.
