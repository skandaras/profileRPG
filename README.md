# LevelUp

A personal productivity platform for tasks and recurring habits. Capture what needs doing,
plan around due dates, and build routines that fit your week. Illustrated avatars,
companions and rewards make progress visible without taking over the daily workflow.
Built for Starbase Home at **levelup.starbasehome.net**, behind Authelia.

![Today workspace with quick task capture and dated work](docs/screens.png)

A travelling keeper and six slightly strange familiars share an ink-and-gouache look:
angular silhouettes, broad painted shadows, weathered cloth and muted jewel colours.
The keeper has two skin tones, five hair colours and four outfits: Wayfarer, Archivist,
Ranger and Lamplighter. Every pet has its own painted egg, baby, teen and adult stages.
Headings use Cormorant
Garamond; reading text and controls use DM Sans. Both fonts are self-hosted with OFL
licences. Five other themes include the light Meadow dawn.

[Product direction and next priorities](./docs/PRODUCT.md).

## What's in it

- **Today**: quick task capture, overdue and due tasks first, an upcoming list, and recurring
  habits due in your own calendar. Completion progress includes tasks and habits. Avatar
  and companion activity follows the work list.
- **History**: searchable completed tasks and daily habit check-ins, including archived
  work, with work-type and date filters. The last seven days show tasks finished, habit
  check-ins and active days. Reopen an older task to return it to Today and correct the
  record. Corrections update XP totals while preserving earned levels and purchases;
  redoing work does not award the same level-up points twice.
- **Onboarding**: name your hero, choose skin tone, hair colour and a complete outfit, choose a Brambleback hedge dragon, Brookbell river seal or Cloverruff moss
  pup, and pick a few habits.
- **Habits and tasks**: sixteen ready-made habits or build your own: daily, chosen weekdays,
  N times a week or every N days, with a difficulty, the stats it trains, and an optional
  amount (log more, earn more, up to double). One-off tasks too.
- **Stats**: Strength, Dexterity, Intellect and Knowledge train from the activities tagged
  with them. Each level-up also gives two points to place anywhere and one ability point.
- **Abilities**: thirteen passive powers (more XP for a stat, slower pet hunger, streak
  shields, shorter missions, a second mission slot…).
- **Pets**: feed, pat, play and tidy. Needs drift down over time; a happy pet gives +5% XP.
  Pets grow from baby to teen to adult. Eggs from missions hatch from the warmth of your
  activity. Missions can bring home Cairnback the stone tortoise, Cloudwool the lamb and
  Lamplume the lantern moth. Pets never die or run away.
- **Welcome back**: the first visit each day finds a little mess in the pet's room. Tidy it
  for coins, give your partner a pat for XP, and keep a daily return streak with gifts.
  Missed habits break their streak and cost a few GP (capped, never below zero), and the
  home page tells you what happened while you were away.
- **Rest mode**: for illness or travel. No fines, no broken streaks, no hungry pets.
- **Missions**: eight timed trips, gated by level, with success odds from your stats
  (and your partner's help). They pay XP, GP and loot: eggs, treats, toys, themes.
- **Shop, wardrobe, themes**: spend GP, choose an outfit and hair colour, and switch between six UI
  themes as you unlock them.
- **Party**: everyone on the server, their hero, level, stats and partner, plus a feed of
  level-ups, hatches and mission triumphs. Task and habit names stay private.

![Completed work history with a seven-day summary](docs/history.png)

## Develop

```sh
cp .env.example .env        # AUTH_MODE=dev signs every request in as DEV_USER
npm install
npm run dev                 # http://localhost:5173
```

In dev mode, `/dev/skip?hours=24` moves the game clock forward, to see a new day's welcome,
a missed habit, a hungry pet or a finished mission without waiting.

| Command | What it does |
|---|---|
| `npm test` | Unit and module tests (Vitest) |
| `npm run check` | Type checks |
| `npm run lint` | ESLint |
| `npm run build && npm run test:ui` | Browser smoke test with screenshots in `test-results/ui/` |
| `npm run db:generate` | New migration after a schema change |
| `SPRITE_PREVIEW=1 npx vitest run src/lib/sprites/preview` | Contact sheets of all art in `test-results/sprites/` |

[AGENTS.md](./AGENTS.md) has the conventions and how to add content or features.
[docs/ART.md](./docs/ART.md) covers the cast, atlas regions, palettes and saved-id mappings.
The direction sheet is in [art/wayfarer/direction.png](./art/wayfarer/direction.png).
`node scripts/generate-icons.mjs` rebuilds the SVG-derived app icons.

## Deploy

Every push to `main` runs CI; when it passes, the deploy job SSHes into the server, pulls,
copies `caddy/levelup.caddy` into Caddy's `sites-enabled`, rebuilds the container and
reloads Caddy (the same steps as the homeserver repo).

One-time setup:

1. **DNS**: point `levelup.starbasehome.net` at the server, unless a wildcard record
   already covers it.
2. **Authelia** (in homeserver-infra): add an access-control rule for
   `levelup.starbasehome.net`, create a `levelup-users` group, and add both of you to it.
3. **On the server**:
   ```sh
   git clone https://github.com/skandaras/profileRPG ~/profileRPG
   cd ~/profileRPG
   docker network inspect shared_net -f '{{range .IPAM.Config}}{{.Subnet}}{{end}}'
   cat > .env <<'ENV'
   TRUSTED_PROXY_IPS=<the subnet printed above>
   ALLOWED_GROUP=levelup-users
   ENV
   ```
4. **GitHub**: add `DEPLOY_HOST` and `DEPLOY_SSH_KEY` as Actions secrets on this repo
   (the same values the homeserver repo uses). Until they exist, CI skips the deploy step.
   Once they are in, run **CI** on `main` from the Actions tab for the first deploy.
5. Optionally, add a tile to the homepage dashboard (`homepage/server.py` in the
   homeserver repo) for the `levelup-users` group.

The database is a SQLite file in the `levelup_levelup-data` Docker volume. To back it up:

```sh
docker run --rm -v levelup_levelup-data:/data -v "$PWD":/out alpine \
  cp /data/levelup.db /out/levelup-$(date +%F).db
```

### Troubleshooting

| Symptom | Cause |
|---|---|
| `403 Forbidden: request did not arrive via the trusted proxy` | `TRUSTED_PROXY_IPS` does not cover Caddy's address on `shared_net` |
| `401 Unauthorized: no identity headers present` | The `authelia` Caddy snippet is not forwarding `Remote-User` |
| `403 ... not in the levelup-users group` | Add the account to the group in Authelia, or clear `ALLOWED_GROUP` |
| Forms fail with a cross-site error | `ORIGIN` does not match the public URL |
