# Clubs Feature (Discovery + Admin)

This repo includes a complete Clubs feature: a public discovery feed, authenticated dashboard views, organizer tools, and admin queues for flags/requests.

## Quick start (dummy data / no backend needed)

The clubs pages can run entirely on in-memory mock data.

1) Create a file named `.env.local` in the project root.
2) Add:

```env
VITE_CLUBS_MOCK=1
```

3) Start the dev server:

```bash
npm run dev
```

When `VITE_CLUBS_MOCK` is enabled, all functions in `src/api/clubs.api.ts` are served by an in-memory mock implementation in `src/api/mock/clubs.mock.ts`.

Notes:
- Mock data is stored in memory. Refreshing the page resets clubs/flags/requests/click counts.
- Auth is unchanged. Public browsing works without login at `/clubs`.

## URLs to view

### Public (no login)
- `/clubs` — public clubs feed

### Dashboard (requires login)
- `/dashboard/clubs` — clubs discovery feed
- `/dashboard/clubs/:id` — club detail
- `/dashboard/clubs/my` — organizer dashboard (My Clubs)

Example IDs included in the mock seed:
- `/dashboard/clubs/club-1`
- `/dashboard/clubs/club-2`
- `/dashboard/clubs/club-3`
- `/dashboard/clubs/club-4`

### Management (requires admin/moderator role)
- `/management/clubs` — admin clubs table (status management)
- `/management/clubs/flags` — flagged clubs review queue
- `/management/clubs/requests` — club requests queue

## How it works

### Data flow

UI pages call React Query hooks in `src/hooks/useClubs.ts`.

Those hooks call the API functions in `src/api/clubs.api.ts`.

- In normal mode, `src/api/clubs.api.ts` uses `httpClient` and hits backend endpoints.
- In mock mode (`VITE_CLUBS_MOCK=1`), `src/api/clubs.api.ts` routes calls to `src/api/mock/clubs.mock.ts`.

### Main pages

- `src/pages/public/PublicClubsFeed.tsx`
  - Public discovery UI (search + interest filters + pagination)
  - “Join Now” logs a click then opens the external link

- `src/pages/dashboard/ClubsFeed.tsx`
  - Authenticated discovery UI
  - Includes “Post Club” (organizers) and “Request a Club” actions

- `src/pages/dashboard/ClubDetail.tsx`
  - Banner + meta + description + interests
  - Join button tracks click and opens external link
  - Report (flag) modal for logged-in users

- `src/pages/dashboard/MyClubs.tsx`
  - Organizer dashboard
  - Edit/Delete actions + per-club analytics panel

- `src/pages/management/AdminClubs.tsx`
  - Moderation table (Live / Flagged / Hidden)

- `src/pages/management/AdminFlags.tsx`
  - Flag review queue (approve/hide/dismiss)

- `src/pages/management/AdminRequests.tsx`
  - Club request queue (fulfilled/dismissed)

### Key components

- `src/components/clubs/ClubCard.tsx` — grid card used by both feeds
- `src/components/clubs/ClubsFilterBar.tsx` — search + interest pill filters
- `src/components/clubs/PostClubModal.tsx` — post/edit club modal
- `src/components/clubs/FlagClubModal.tsx` — report flow
- `src/components/clubs/RequestClubModal.tsx` — request flow
- `src/components/clubs/ClubAnalyticsPanel.tsx` — analytics display + CSV export

### Mock data

Mock mode is implemented in:
- `src/api/mock/clubs.mock.ts`

It seeds:
- A few clubs with banners from `/public/assets/...`
- One pending flag
- Two requests (pending + fulfilled)

You can edit the seed arrays (`clubs`, `flags`, `requests`) to match your campus data.

## Backend endpoints expected (non-mock)

If/when you connect to a backend, these endpoints are expected by `src/api/clubs.api.ts`:

- `GET /clubs`
- `GET /clubs/:id`
- `POST /clubs` (multipart/form-data)
- `PATCH /clubs/:id` (multipart/form-data)
- `DELETE /clubs/:id`
- `POST /clubs/:id/click`
- `GET /clubs/:id/analytics`
- `GET /clubs/:id/analytics/export`
- `POST /clubs/:id/flag`
- `GET /clubs/flags`
- `PATCH /clubs/flags/:flagId`
- `POST /clubs/requests`
- `GET /clubs/requests`
- `PATCH /clubs/requests/:requestId`
- `PATCH /clubs/:id/status`
