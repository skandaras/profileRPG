# Art contract

Everything visible in LevelUp is drawn in code today (`src/lib/sprites/art/`), as
placeholder art. Any piece can be replaced with a PNG without touching game code. This
page is what a PNG has to satisfy.

To see the current art: `SPRITE_PREVIEW=1 npx vitest run src/lib/sprites/preview`, then
open `test-results/sprites/avatar-parts.png`, `pets.png` and `icons.png`.

## Style

Pixel art, chibi proportions, anime/monster-collector feel. A one-pixel dark outline
(`#2b1f33`) around every shape, light from the upper left, two or three shades per colour.
No anti-aliasing and no partial transparency: every pixel is fully opaque or fully clear.

## Sizes

| What | Frame | Notes |
|---|---|---|
| Avatar part | 32 × 40 | Every part is a full frame, so parts line up by position alone |
| Pet, each stage | 32 × 32 | Feet on row 30; row 31 is left for the outline |
| Pet accessory | 12 × 8 | Head pieces sit on the bottom row |
| Icon | 16 × 16 | Items, food, toys |
| Room mess | 12 × 12 | The welcome-back clutter |

Animation is optional. A single frame gets an automatic idle bounce (everything above row
33 for avatars, row 24 for pets, drops one pixel on the second frame). To animate by hand,
put frames side by side in one PNG (64 × 40 for a two-frame avatar part) and set `frames`.

## Avatar landmarks (32 × 40)

- Head: an ellipse centred on (15.5, 18), rows 11–24, about x 8–23
- Eyes: rows 18–21, at x 10–12 and 19–21
- Torso: rows 26–32, x 11–20; arms x 9–10 and 21–22; hands on row 32
- Legs: rows 33–36; feet rows 37–38
- Rows 0–10 are headroom for hair, ears and hats

## Layers

Parts are drawn back to front by depth (`src/lib/sprites/frames.ts`):

| Depth | Layer |
|---|---|
| 0 | back: long hair, capes, wings, backpacks |
| 2 | tails |
| 10 | body |
| 20 | bottoms |
| 25 | shoes |
| 30 | tops |
| 35 | scarves and straps |
| 40 | face |
| 45 | features (freckles, glasses) |
| 50 | hair |
| 55 | animal ears |
| 60 | hats |
| 70 | held items |

One part can contribute several layers. Long hair is a back layer at 0 and a fringe at 50.

## Colours: the reference palette

Players pick their skin tone, hair colour, eye colour and clothing dyes. A PNG is drawn in
the **reference palette** below, and at render time every pixel that exactly matches a
reference colour is swapped for the player's choice in the same shade. Every other colour
stays as drawn, so a gold buckle or a white sole can be any colour except these.

| Channel | Shadow | Base | Light | Used for |
|---|---|---|---|---|
| skin | `#dc9b7c` | `#f5c6a5` | `#ffe2cc` | skin |
| hair | `#77321a` | `#a44a26` | `#cb6d3f` | hair, animal ears and tails |
| eye | `#4a2b1a` | `#7c4c2b` | `#b27c4c` | irises |
| primary | `#9c2939` | `#d6455a` | `#f2808d` | the dyeable part of clothing |
| secondary | `#b3b7c8` | `#e6e8f0` | `#ffffff` | a part's second colour (fixed per item) |
| accent | `#a2761a` | `#e0b030` | `#ffe48a` | trims, buckles, hair ties (fixed per item) |

These are defined as `REFERENCE_PALETTE` in `src/lib/content/palettes.ts`.

Pets are not recoloured by the player; draw them in their final colours. Their palettes are
in `src/lib/content/pets.ts`, but a pet PNG can use any colours.

## Pet anchors

Each pet stage reports two points so accessories land in the right place on every species:

- `head`: the bottom-centre of a hat or bow, usually the top of the head
- `neck`: the centre of a collar or bandana

## Where files go, and how to switch one on

Put PNGs under `static/sprites/`:

- `static/sprites/avatar/<slot>/<id>.png`, e.g. `static/sprites/avatar/hair/bob.png`
- `static/sprites/pets/<species>/<stage>.png`, e.g. `static/sprites/pets/emberkit/teen.png`
- `static/sprites/icons/<id>.png`

Then point the catalogue entry at it. For an avatar part, in
`src/lib/content/cosmetics.ts`, replace a layer's `art`:

```ts
{ z: Z.hair, art: { png: '/sprites/avatar/hair/bob.png', w: 32, h: 40 } }
```

For a pet stage, in `src/lib/content/pets.ts`:

```ts
teen: { png: '/sprites/pets/emberkit/teen.png', anchors: { head: [13, 8], neck: [14, 19] } }
```

For an icon, set `icon: { png: '/sprites/icons/kibble.png', w: 16, h: 16 }`.

## Designing new pets

A species needs four images (egg, baby, teen, adult), a name, a blurb, a stat affinity and a
rarity. The three starters (Emberkit, Puddlefin, Mossling) are placeholders: their names,
looks and blurbs can all change, but keep the ids (`emberkit`, `puddlefin`, `mossling`),
which are stored on every pet. A new species that hatches from mission eggs also needs an
`{ egg: '<id>' }` entry in at least one mission's loot table; the content tests fail until
it has one.
