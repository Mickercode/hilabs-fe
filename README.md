# hilabs-fe

The HiLabs learner application: Next.js and React. The marketing home page lives here too, as a
static site.

HiLabs is a learning platform and a research study. Learners explore, learn among practitioners,
practise against the gaps in their own work, and leave with a portfolio. No grades, no rankings,
no labels.

## Stack

| | |
| --- | --- |
| Runtime | Node 22 |
| Framework | Next.js 16, React 19, TypeScript |
| Styling | CSS custom properties from the HiLabs design system. No utility framework |

Styling deliberately uses the design system's own tokens rather than a utility framework: the
brand already defines colour, type, spacing and radius as tokens, and a second source of truth for
those would drift from it.

## Two things in one repo

| Path | What it is | How it deploys |
| --- | --- | --- |
| `app/` | The learner application | Next.js server |
| `marketing/` | The home page | Static files |

`marketing/` is plain HTML, one inline stylesheet and two small JS modules. It is **not** a React
app and should not become one. It is the page most people meet on the worst connection, so it
loads without a bundle, works with WebGL disabled, and works on save-data. `marketing/verify.py`
checks it against the design brief on every push: token colours only, the two brand typefaces
only, the logo unmodified, WCAG AA on every text-on-background pair, and every copy passage
matching the agreed wording.

## Structure

```
app/
  layout.tsx               fonts, metadata, the design tokens
  error.tsx                a real message and one action, not an apology
  not-found.tsx
  loading.tsx
  (learner)/               the learner journey, inside the app shell
    layout.tsx
    page.tsx               the four steps, and where each one leads
    explore/               01 the six Discovery challenges
    learn/                 02 practitioner material from the library
    develop/               03 targeted practice
    demonstrate/           04 the portfolio
components/
  ui/                      Button, Card, Callout, PageHeader
  layout/                  AppShell, AppNav, Logo
lib/
  api/                     one typed client, one module per domain
  config.ts                runtime configuration
  steps.ts                 the four steps, defined once
types/api.ts               the shapes the API returns
marketing/                 the static home page
```

Pages keep their async work in a child component behind `<Suspense>`, so the shell prerenders
and only the data streams. `/explore` and `/learn` build as partial prerenders for that reason.

API field names stay `snake_case` because they come from the database, which owns the schema.
Renaming them here would add a layer that drifts the first time a column is added.

## Low bandwidth is a requirement

Many learners will arrive on a mid-range Android over a slow connection. First load stays under
400KB, Largest Contentful Paint under 2.5s, and anything heavier — 3D, video, large imagery —
loads afterwards, and only when the device and connection allow it.

## Getting started

```sh
cp .env.example .env.local
npm ci
npm run dev
```

The app expects the API from the `hilabs-be` repository on `http://localhost:3000`. Without it
the pages still render: each data view says the API is unreachable rather than failing.

The marketing page needs no build. Serve it from any static host, or locally:

```sh
python -m http.server 8080 --directory marketing
```

## Branches

`production` and `staging`, feature branches off `staging`. See [CONTRIBUTING.md](CONTRIBUTING.md).
