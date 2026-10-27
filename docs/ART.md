# Art contract

LevelUp uses Garden Storybook pixel art. Catalogue ids are permanent: saved pets,
outfits and inventory entries point at them. A new drawing or display name keeps its id.

The source drawings are palette-indexed grids in `src/lib/sprites/art/`. PNG replacements
use the same frames and composition. Run
`SPRITE_PREVIEW=1 npx vitest run src/lib/sprites/preview` to write the six contact sheets
in `test-results/sprites/`: avatar-parts, keeper, pets, brambleback, icons and bed.
Inspect art at native size and an integer enlargement, against light and dark surfaces.

## Garden style

- Outline silhouettes with one dark pixel, `#2b1f33`. Pupils use `#1a1322`.
- Round shapes with broad, even stair steps, usually runs of 2–3 pixels. Keep related
  curls and lobes joined. Leave space between face, hair and clothes.
- Use three flat shades per material. Base colour fills most of the shape; broad
  highlights sit upper left, with one connected shadow below or to the right.
- Join highlights into patches of at least two pixels. Single eye glints and small
  fittings may use one pixel. Avoid speckled fur, checkerboards and dithering.
- Every pixel is fully clear or fully opaque. No anti-aliasing, gradients, soft shadows
  or translucent tints. Render sprites at integer scales with nearest-neighbour sampling.
- Pets must not have cat shapes. Brambleback has a long snout, swept horns, folded
  leather wings and a spiny tail. Brookbell has swimming flippers; Cloverruff has
  hanging ears and four paws. Cairnback has a shell, Cloudwool has curled horns, and
  Lamplume has feathered antennae and folded wings. Keep these silhouettes as they grow.
  The keeper's shipped cat ears and tail remain avatar choices.

Fixed pet and prop ramps favour clay, cream, moss, warm gold and muted river colours.
Brambleback's body is `#9b5140 / #cd815b / #efbc83`, cream is
`#b2a77e / #e5d9ae / #fff2d3`, moss is `#426647 / #78915c / #b2c98a`, and
Garden gold is `#9b652d / #d9a84e / #f7d998` (shadow / base / light).
Species and materials can use their own ramps. Preserve player skin, hair and dye choices.

Interface colours come from theme tokens in `content/themes.ts`; artwork palettes live
with the art or its catalogue. The room remains a CSS scene using theme tokens. Paper
cards have stepped corners and a quiet lower edge. Pixelify Sans 500 carries headings,
buttons, navigation and numbers; DM Sans carries body text, labels and form values.

## Frames and animation

| Art | Native frame | Placement |
|---|---|---|
| Avatar part | 32 × 40 | Full frame at the origin |
| Pet stage, including eggs | 32 × 32 | Feet end on row 30; outline may use row 31 |
| Pet accessory | 12 × 8 | Head pieces meet their anchor at bottom centre |
| Item, food, toy or UI icon | 16 × 16 | Static, integer scales |
| Room mess | 12 × 12 | Five welcome-back props |
| Pet bed | 28 × 10 | Static room prop |
| App icon | 16 × 16 grid | SVG and 180/192/512px PNGs share one grid |

Coordinates start at zero. Frame sizes and avatar depths live in `sprites/frames.ts`;
`PET_ACC` lives in `sprites/art/pets.ts`.

A single avatar or pet frame gets an automatic second idle pose: rows above the pivot
move down one pixel, while lower rows stay planted. The pivots are row 33 for avatars
and row 24 for pets. The bounce applies to the whole composite, including accessories.
For hand animation, put frames side by side and declare `frames` (e.g. a two-frame avatar
PNG is 64 × 40; a two-frame pet PNG is 64 × 32). The highest declared frame count wins;
a layer with fewer frames holds its last frame. UI icons and room props stay still.

## Avatar landmarks and layers

- Head: centred on (15.5, 18), rows 11–24, about x 8–23.
- Eyes: x 10–12 and 19–21, with Garden eye details on rows 19–21.
- Torso: rows 26–32, x 11–20; arms x 9–10 and 21–22; hands on row 32.
- Legs: rows 33–36; feet rows 37–38. Rows 0–10 leave room for hair, ears and hats.

Parts paint from back to front:

| Depth | Layer |
|---|---|
| 0 | Back hair, capes, wings, backpacks |
| 2 | Tails |
| 10 | Body |
| 20 | Bottoms |
| 25 | Shoes |
| 30 | Tops |
| 35 | Scarves, straps, overall bib |
| 40 | Face |
| 45 | Features: freckles, glasses, bandage, star |
| 50 | Front hair |
| 55 | Animal ears |
| 60 | Hats |
| 70 | Held items |

One part can supply several layers. Overalls put trousers at 20 and their bib at 35.
Every hair style has back and front layers; the fringe outline ends on row 17 to clear
brows and eyes. Closed hats declare `coversHairAbove` at their brim row. The renderer
clips both hair layers above that row for grids and PNGs. Bands and crowns keep full hair.
Check all hair/hat fits and faces on light and dark skin, in both idle frames.

## Reference colours and fixed colours

Avatar and accessory PNGs use the exact reference colours below. The renderer swaps each
match for the same channel and shade in the selected palette. Every other colour stays
as drawn. These channels are defined in `content/palettes.ts` as `REFERENCE_PALETTE`.

| Channel | Shadow | Base | Light | Use |
|---|---|---|---|---|
| skin | `#dc9b7c` | `#f5c6a5` | `#ffe2cc` | Skin |
| hair | `#77321a` | `#a44a26` | `#cb6d3f` | Hair, animal ears and tails |
| eye | `#4a2b1a` | `#7c4c2b` | `#b27c4c` | Irises |
| primary | `#9c2939` | `#d6455a` | `#f2808d` | Clothing dye or accessory tint |
| secondary | `#b3b7c8` | `#e6e8f0` | `#ffffff` | Second material, fixed per item |
| accent | `#a2761a` | `#e0b030` | `#ffe48a` | Trim and fittings, fixed per item |

Fixed white is **`#fffefd`**, distinct from secondary light **`#ffffff`**. Preserve that
one-value difference in PNGs so white soles and eye glints keep their colours.
`FIXED_COLORS` in `sprites/grid.ts` also supplies outline, pupil and blush colours.

Faces put mouths, brows and sleepy lids in primary shadow; cheery lids use primary base.
Freckles use the same ink channel. `faceInkRamp()` supplies dark ink on lighter skin and
warm light ink on Umber and Deep. Export those strokes in reference primary colours;
fixed dark strokes would lose contrast on dark skin.

Pet grids use their species palette from `content/pets.ts`. **Pet PNGs keep their final
colours**, even where they match a reference colour. `petFigure()` marks their layer
`fixedColors: true`. Accessories still recolour from the reference palette, using their
catalogue tint and accent. Do not export a tinted pet PNG expecting a later colour swap.

## Pets and anchors

The starters are Brambleback (`emberkit`), Brookbell (`puddlefin`) and Cloverruff
(`mossling`). Missions add Cairnback (`pebblet`), Cloudwool (`fluffle`) and Lamplume
(`glimmerwing`). All six face left and have a cream egg with their own mark or crest.

Each stage supplies `head` (bottom centre of a hat/bow) and `neck` (centre of a collar).
Current anchors, written as `head / neck`:

| Species | Egg | Baby | Teen | Adult |
|---|---|---|---|---|
| Brambleback | 16,15 / 16,26 | 14,16 / 14,29 | 14,12 / 14,25 | 14,9 / 14,22 |
| Brookbell, Cloverruff | 16,15 / 16,26 | 13,16 / 13,29 | 13,12 / 13,25 | 13,9 / 13,22 |
| Cairnback | 16,15 / 16,26 | 10,18 / 10,29 | 10,15 / 10,26 | 10,12 / 10,23 |
| Cloudwool, Lamplume | 16,15 / 16,26 | 11,16 / 12,29 | 11,12 / 12,25 | 11,9 / 12,22 |

For a 12 × 8 accessory, horizontal offset is `round(ax - 6)`. Head offset is `ay - 7`;
neck offset is `round(ay - 4)`. Eggs never wear accessories. If a redraw moves an anchor,
check all six accessories on all hatched stages and keep eyes visible in both idle poses.

A new species needs egg, baby, teen and adult art, a name, blurb, stat affinity and rarity.
Mission species also need an `{ egg: '<id>' }` drop in at least one mission's loot table.
Content tests check references and drop access. Never remove or repurpose a shipped id.

## Files and PNG registration

| Art | Source or registry | PNG replacement path |
|---|---|---|
| Keeper body, faces, hair, first outfit | `sprites/art/garden-avatar.ts`, `art/avatar.ts` | `static/sprites/avatar/<slot>/<id>.png` |
| Other wardrobe parts | `sprites/art/garden-wardrobe.ts`, `content/cosmetics.ts` | Same avatar path |
| Pets and pet accessories | `sprites/art/pets.ts`, `content/pets.ts`, `content/cosmetics.ts` | `static/sprites/pets/<species>/<stage>.png`, `static/sprites/pet-accessories/<id>.png` |
| Food, toys, items, room props | `sprites/art/icons.ts`, `content/items.ts`, `sprites/room.ts` | `static/sprites/icons/<id>.png` |
| UI symbols | `sprites/art/ui.ts`, shared `art/icons.ts`, `sprites/ui-icons.ts` | `static/sprites/icons/<id>.png` |
| App icons | `scripts/generate-icons.mjs` | `static/icon.svg`, `static/icon-{180,192,512}.png` |
| README image | Real app captures | `docs/screens.png` |

Source paths in the table are under `src/lib/` unless given in full. PNG paths describe
the replacement convention; current catalogue art is drawn as grids.

An avatar layer in `content/cosmetics.ts` can point to a PNG:

```ts
{ z: Z.hair, art: { png: '/sprites/avatar/hair/bob.png', w: 32, h: 40, frames: 1 } }
```

Keep other layers of the part (such as back hair). Pet stages in `content/pets.ts` declare
frame count and anchors without repeating the fixed 32 × 32 dimensions:

```ts
teen: { png: '/sprites/pets/emberkit/teen.png', frames: 2, anchors: { head: [14, 12], neck: [14, 25] } }
```

That PNG is a 64 × 32 strip in final pet colours. A pet accessory uses ordinary `Art`
with `w: 12, h: 8` and its existing `place` and tint. A consumable sets
`icon: { png: '/sprites/icons/kibble.png', w: 16, h: 16 }`.

Named UI icons in `sprites/ui-icons.ts` accept `art: { sprite }` or
`art: { png: '/sprites/icons/house.png', w: 16, h: 16 }`, a palette and optional
`fixedColors: true`. Default PNGs recolour reference channels; fixed-colour PNGs bypass
that swap. `PixelIcon.svelte` uses the registry and clamps display scale to positive
integers. Give standalone meaningful art a label; keep adjacent icons decorative and
name icon-only controls in words.

The PNG decoder in `sprites/render.ts` serves the browser; `sprites/preview-png.ts`
loads the same assets for contact sheets. Regression tests compare reference PNGs with
grids, fixed pet colours, frame strips, hat clipping and accessory fits.

## Emoji display

`src/lib/display-icon.ts` maps known emoji and check/star variants to shared UI symbols.
`DisplayIcon.svelte` renders them as pixels and leaves unknown or custom text as text.
Catalogue values, saved habit icons, notices and party feed producers keep their original
strings. Do not migrate them to icon names. Add known aliases in this mapping, test them
in `display-icon.test.ts`, and reuse the same symbol wherever the idea appears.
The habit picker saves the original emoji value. Icons beside text are decorative.

## App icons and README captures

Run `node scripts/generate-icons.mjs` from the repo root to rebuild all app icons. The
Brambleback portrait uses a 16 × 16 grid, the Garden pet ramps and Meadow paper. The SVG
keeps a projecting snout, narrow swept horns and an angular folded wing legible at 16px.
It uses integer rectangles and `shape-rendering="crispEdges"`. PNGs use 11×, 12× and 32×
pixels; the 180px icon has a 2px paper inset so no sprite pixel needs fractional scaling.
Manifest background/theme colours and the default browser theme colour use Meadow's
`bg`, currently `#f1eadc`. The browser colour follows the player's theme on server render
and after settings changes; keep a single `meta theme-color`.

`docs/screens.png` shows five phone viewports from the real app: Home, Home on a
welcome-back visit, pet care, missions and party, all in Meadow. Use an isolated dev
database, wait for fonts and sprite images, dismiss notices, and keep the exported strip
under 400 KB. One-off capture scripts belong outside the repo.
