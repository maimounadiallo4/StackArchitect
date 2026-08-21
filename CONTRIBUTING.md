# Contributing to Stack Architect

First off — thanks for taking the time to contribute. Whether it's a new technology in the catalog, a bug fix, a translation, or a design tweak, it's appreciated.

## Table of contents

- [Ways to contribute](#ways-to-contribute)
- [Getting set up](#getting-set-up)
- [Workflow: fork, branch, PR](#workflow-fork-branch-pr)
- [Commit message convention](#commit-message-convention)
- [Code style](#code-style)
- [🧩 How to add a new technology or layer](#-how-to-add-a-new-technology-or-layer)
- [Reporting bugs](#reporting-bugs)

## Ways to contribute

- 🐛 Report bugs or confusing UX via [Issues](https://github.com/maimounadiallo4/StackArchitect/issues)
- 🧩 Add a missing technology to the catalog (see below — this is the most common and most welcome contribution)
- 🌍 Improve or add a translation in `src/i18n/translations.ts`
- 🎨 Polish the UI, fix an accessibility gap, or improve responsive behavior
- 📝 Improve documentation

## Getting set up

```bash
git clone https://github.com/<your-username>/StackArchitect.git
cd StackArchitect
npm install
npm run dev
```

Before opening a PR, make sure the project still type-checks:

```bash
npm run lint
```

There's no test suite yet — if you'd like to add one, that's a welcome contribution in itself.

## Workflow: fork, branch, PR

1. **Fork** the repository and clone your fork locally.
2. **Branch** off `main` with a descriptive name: `feat/add-supabase-storage`, `fix/mobile-sheet-overflow`, `i18n/spanish-translation`.
3. **Commit** your changes following the convention below.
4. **Push** to your fork and **open a Pull Request** against `main`.
5. Fill in the PR description: what changed, why, and how you tested it (a screenshot or GIF is worth a thousand words for UI changes).
6. A maintainer will review, may request changes, and will merge once it's ready.

Keep PRs focused. A PR that adds three unrelated technologies and refactors the header at the same time is harder to review and more likely to stall — split it up.

## Commit message convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Format:

```
<type>(<optional scope>): <short summary>
```

Common types:

| Type | Use for |
|---|---|
| `feat` | A new feature (e.g. a new export format, a new layer) |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `chore` | Tooling, dependencies, config |
| `i18n` | Translation additions or fixes |

Examples:

- `feat(catalog): add Supabase Storage to the storage layer`
- `fix(diagram): prevent lane labels from overlapping on narrow screens`
- `i18n(fr): fix wording in the extras step subtitle`

## Code style

- TypeScript, strict-ish — run `npm run lint` before pushing.
- Components are functional, typed with `React.FC<Props>`.
- Styling is Tailwind CSS v4 utility classes, using the design tokens defined in `src/index.css` (`var(--surface-*)`, `var(--text-*)`, `var(--border-*)`, `bg-accent-500`, etc.) rather than hardcoded hex colors, so both themes stay correct.
- User-facing strings go through the i18n dictionary (`src/i18n/translations.ts`) rather than being hardcoded in components — see below.
- Keep PRs small and avoid introducing new dependencies unless there's a strong reason (open an issue to discuss first).

---

## 🧩 How to add a new technology or layer

This is the single most valuable contribution to this project, and it's designed to be quick. Here's exactly where to make each kind of change.

### Adding a new technology to an existing layer

All technologies live in one place: **`src/engine/catalog.ts`**, in the `TECH_CATALOG` array.

1. Open `src/engine/catalog.ts` and find the category comment block that matches where your technology belongs (e.g. `// --- DATABASE ---`).
2. Add a new object to the `TECH_CATALOG` array with this shape (see `Technology` in `src/types.ts` for the full type):

   - `id` — a unique, lowercase, no-spaces identifier (e.g. `"planetscale"`). This is the key used everywhere else, including the logo map.
   - `name` — the display name (e.g. `"PlanetScale"`).
   - `category` — one of the existing `TechCategory` values (`"database"`, `"backend"`, `"ai_llm"`, etc.)
   - `tier`, `defaultDeploymentZone`, `supportedProtocols`, `typicalOutboundTo` — used by the architecture engine to lay out nodes and draw connections. Copy the shape from a similar existing entry in the same category.
   - `tagline`, `description`, `roleInArchitecture`, `bestFor` — the copy shown in the wizard cards and the inspector panel. Keep these in English (the catalog's technical descriptions are intentionally not translated — see the i18n note below).
   - `accentColor`, `badgeColor`, `iconName` — `accentColor` is the fallback tint used when there's no real logo (see next step); `iconName` is a [lucide-react](https://lucide.dev/icons) icon name used as the fallback icon.
   - `pricingModel` — one of `"Open Source" | "Freemium" | "Managed SaaS" | "Cloud Resource"`.
   - `documentationUrl` — the official docs link.

3. **Give it a real logo.** Open `src/engine/logos.ts`:
   - Check whether [simple-icons](https://github.com/simple-icons/simple-icons) has your brand: search [simpleicons.org](https://simpleicons.org).
   - If it exists, import the named export (e.g. `siPlanetscale`) at the top of the file and add an entry to the `TECH_LOGOS` map: `planetscale: siPlanetscale,`.
   - If the brand isn't in `simple-icons` (this happens — a few brands like AWS and Twilio have been removed from the dataset for trademark reasons), just skip this step. The UI automatically falls back to the lucide `iconName` on a tinted `accentColor` chip, so nothing breaks.

4. That's it. The new technology will automatically show up in the Stack Picker sidebar, the wizard's layer step for its category, and the "Anything else?" extras step if its category isn't part of the active project type's recipe.

5. *(Optional but appreciated)* If the technology commonly triggers an architectural pitfall (e.g. "needs a backend", "conflicts with X"), consider adding a rule to `src/engine/validator.ts`.

### Adding a brand-new layer (category)

This is a bigger change — only needed if your technology doesn't fit any of the 15 existing categories in `TechCategory`.

1. Add the new category to the `TechCategory` union in `src/types.ts`.
2. Add an icon for it in `CATEGORY_METADATA` in `src/engine/catalog.ts` (a lucide icon name).
3. Add its label and description in **both languages** in `src/i18n/translations.ts`, under the `categories` key in both the `en` and `fr` objects (TypeScript will error if you miss one — the two objects are type-checked against each other).
4. Reference the new category in `WIZARD_RECIPES` in `src/engine/projectTypes.ts` for whichever project types should ask about it (mark it `required: true` if it's essential, `required: false` if it's optional).
5. Add at least one technology in that category (see above).

### Adding a new project type

1. Add it to the `ProjectType` union in `src/types.ts`.
2. Add an entry to `PROJECT_TYPE_META` in `src/engine/projectTypes.ts` (icon + accent color).
3. Add a layer recipe for it in `WIZARD_RECIPES` in the same file — the ordered list of categories the wizard will ask about.
4. Add its label and tagline in **both languages** in `src/i18n/translations.ts`, under `projectTypes`.

### A note on translations

UI chrome (buttons, labels, headings, category and project-type names) is translated via `src/i18n/translations.ts`. Long-form technical content — technology descriptions, taglines, validator messages, and preset descriptions — is intentionally kept in English only, to keep the catalog maintainable. If you want to change that scope, open an issue to discuss first.

## Reporting bugs

Open an [issue](https://github.com/maimounadiallo4/StackArchitect/issues/new) with:

- What you expected to happen, and what actually happened
- Steps to reproduce
- Browser/OS if it looks visual or layout-related
- A screenshot or screen recording if you have one

Thanks again for contributing. 🙌
