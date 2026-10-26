# Working in this repository

LevelUp is a habit tracker played as a pixel-art pet RPG, served at
levelup.starbasehome.net behind Caddy and Authelia. SvelteKit 2 + Svelte 5 on Node 22,
Drizzle + better-sqlite3, one Docker image. Claude and Codex both work here; this file is
what both are expected to know.

## Pushing to `main` deploys

CI runs on every push. On `main`, a green run deploys straight to the live server
(`.github/workflows/ci.yml`). Work on a branch and merge when it is ready.

## Before you commit

```sh
npm run lint && npm run check && npm test
```

All three, every time. If you touched a page, a component or anything the build resolves,
also run `npm run build && npm run test:ui`. The smoke test drives a real browser through
onboarding and a day of play and saves screenshots to `test-results/ui/`; look at them.

## Where things live

- `src/lib/game/`: the rules, as pure functions with no database: levels, rewards, stat
  training, schedules and periods, rollover of missed periods, pet needs, missions, loot,
  modifiers, the welcome-back ritual. Most tests live here.
- `src/lib/content/`: every catalogue (cosmetics, species, items, themes, abilities,
  missions, habit templates, palettes). Data only.
- `src/lib/sprites/`: the sprite format, drawing primitives, compositor and code-drawn art.
  See `docs/ART.md`.
- `src/lib/server/modules/`: the domain modules that touch the database.
- `src/lib/server/game.ts`: `play()`, the one way into game state.
- `src/routes/`: pages. Loads use `read()`, form actions use `act()`, both from
  `$lib/server/api`.

## How to add things

**Content** (a hat, a mission, a species, a theme, an ability, a habit template): add an
entry to the catalogue in `src/lib/content/`. The database stores ids only, so no migration.
An id that has shipped is permanent: someone's inventory points at it. `content.test.ts`
checks ids are unique, references resolve, and every drop-only item can actually be found.

**A rule tweak** (XP curve, fines, decay rates): the numbers sit at the top of the relevant
file in `src/lib/game/`. Change them there and update the tests that pin the pacing.

**A new power**: an ability is a list of modifier effects (`content/abilities.ts`). If the
effect needs a new modifier key, add it to `ModifierKey` in `content/types.ts` and read it
with `mod()` where the rule is applied.

**A new feature that reacts to play** (achievements, cheers, party quests): write a module
in `src/lib/server/modules/` that registers handlers with `on()` from `events.ts`, and
import it in `modules/index.ts`. Events available: `activity.logged`, `activity.undone`,
`level.up`, `mission.claimed`, `pet.hatched`. Add an event to `GameEvent` if you need one.
Handlers run inside the action's transaction; a handler that hands something out on
`activity.logged` records it under its own key in `event.effects` and takes it back on
`activity.undone`.

## Rules that are not style

**Everything goes through `play()`.** It opens the transaction, catches up on missed
periods and the day's welcome, then runs your function. Do not read or write game tables
outside it from a route.

**Time comes from `clock.now()` or `ctx.now`**, never `Date.now()` in game code. Days and
periods are integers from `game/schedule.ts`, in the player's own timezone and day-start
hour. Dev mode can skip ahead with `/dev/skip?hours=N`, and that only works if nothing reads
the wall clock directly.

**Ownership lives in the SQL predicate**: `eq(table.userId, ctx.userId)` in the query, not
a check afterwards. Something that exists but is not yours throws `NotFound` (a 404).
A refusal the player should read throws `GameError` with words written for them.

**Gentle by design.** A missed habit costs its streak and a few GP (capped per visit,
never below zero). Pets never die or leave. Rest mode pauses all of it. Keep new mechanics
in that spirit: reward showing up, never punish being away.

**Habit titles are private.** The party feed (`modules/feed.ts`) carries levels, hatches,
missions and streak counts, never what someone is working on.

**Removing something removes all of it**: its catalogue entry, its code, its tests, its
comments. After a schema change, `npm run db:generate` and commit the SQL. Migrations stay
additive so the previous image can still read the database.

## Tests

Vitest in node, no DOM. Logic that needs testing lives in `src/lib/**/*.ts`, not in
`.svelte` files. Each worker gets its own `DATA_DIR` (`src/test-setup.ts`), so suites write
to the database freely. `src/lib/server/game.test.ts` drives the whole loop through
`play()` with a pinned clock; extend it when you add a module.

## Style

Tabs, single quotes, semicolons; there is no formatter, so match the file. Svelte 5 runes
only (`$state`, `$derived`, `$effect`, `$props`); no `export let`, no `$:`, no stores, no
`on:click`, no `<slot>`. Interface colours come from theme tokens (`var(--accent)` and
friends, defined in `content/themes.ts`), never hard-coded in a component; sprite palettes
are art and live with the art. `themes.test.ts` holds every theme to WCAG AA. The shared
look (`.box`, `.btn`, `.chip`, `.bar`, `.tile`) is in `src/app.css`. Forms use
`use:enhance={withNotices()}` so results become toasts.

Comments say why the code has its shape, not what it does.

## Writing

Comments, commit messages, docs and every string a player reads: plain words, no padding.
Avoid *honest, silently, delve, robust, seamless, leverage, journey (as a metaphor)*, the
"It's not X, it's Y" contrast, and stopping to announce that something is worth noting.
Commit messages are prose: a sentence on what changed and why, then the reasoning.

## Art

`docs/ART.md` is the contract for replacement art: frame sizes, layer order, anchors, the
reference palette PNGs are drawn in, and where files go. To see all current art,
`SPRITE_PREVIEW=1 npx vitest run src/lib/sprites/preview` and open `test-results/sprites/`.
