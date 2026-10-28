# Art contract

LevelUp uses painted watercolour characters for the default keeper and Brambleback,
phase-2 SVG icons, and pixel fallback art for the remaining catalogue. The painted
contract is below; the pixel contracts remain for unfinished batches. Catalogue ids are
permanent: saved pets, outfits and inventory entries point at them.

Character and room source drawings are palette-indexed grids in `src/lib/sprites/art/`.
UI, item, food and toy icons are SVG fragments in that directory. PNG replacements
use the same frames and composition. Run
`SPRITE_PREVIEW=1 npx vitest run src/lib/sprites/preview` to write the six contact sheets
in `test-results/sprites/`: avatar-parts, keeper, pets, brambleback, icons and bed.
Inspect art at native size and an integer enlargement, against light and dark surfaces.

## Garden pixel characters and props

- Outline silhouettes with one dark pixel, `#2b1f33`. Pupils use `#1a1322`.
- Round shapes with broad, even stair steps, usually runs of 2–3 pixels. Keep related
  curls and lobes joined. Leave space between face, hair and clothes.
- Use two flat shades for tiny materials, up to three where space supports them.
  Base colour fills most of the shape; broad
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
with the art or its catalogue. The room remains a CSS scene using theme tokens. The tarot spread uses
double-ruled frames and arched portrait panels. Cormorant Garamond carries headings
and large numbers; DM Sans carries reading text, controls and navigation. Both are
self-hosted with their OFL texts in `static/fonts/`. Browser icons inherit the current
theme ink as fine SVG outlines; catalogue palettes remain available to sprite previews.

## Frames and animation

| Art | Native frame | Placement |
|---|---|---|
| Avatar part | 32 × 40 | Full frame at the origin |
| Pet stage, including eggs | 32 × 32 | Feet end on row 30; outline may use row 31 |
| Pet accessory | 12 × 8 | Head pieces meet their anchor at bottom centre |
| Item, food, toy or UI icon | SVG viewBox 0 0 32 32 | Static; 16, 24 or 32 CSS px |
| Room mess | 12 × 12 | Five welcome-back props |
| Pet bed | 28 × 10 | Static room prop |
| App icon | SVG viewBox 0 0 32 32 | Dedicated 16-unit small drawing; 180/192/512px PNG exports |

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

`avatar-cleanup.test.ts` guards every avatar layer: no detached single pixels except
the four named freckles, no one-pixel shade patches except eye ink/glints, two shades
per connected material smaller than 32 pixels (up to three for larger pieces), a
majority base fill when shaded, and at most one shadow per connected material.
Diagonal pixel neighbours count as joined. Mirrored parts compare outline and material
boundaries about x=15.5 before lighting; all faces, the skirt, tunic and boots also
compare exact shade values. Directional parts (ponytail, tail, overlapping kimono, side
features, scarf, held sword and asymmetric hats) are listed explicitly in the guard.

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

Faces put mouths, brows, calm and sleepy lids in primary shadow; cheery lids use primary base.
Freckles use the same ink channel. `faceInkRamp()` supplies dark ink on lighter skin and
warm light ink on Umber and Deep. Export those strokes in reference primary colours;
fixed dark strokes would lose contrast on dark skin. Open eyes use a pupil, a flat iris
and one glint; Sparkly joins the glint into a single bright corner. Determined leaves an
empty row between brows and eyes.

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

`pet-cleanup.test.ts` extends the avatar guards to all 24 pet stages, six accessories,
five mess props and the bed. Finished eggs, accessories and bed mirror exactly,
including material boundaries and lighting. Egg emblems stay inside the shared shell;
pets keep their side-on shapes and the anchors above. All drawings reject stray pixels,
one-pixel colour patches, extra shades on tiny materials, split shadows and shaded
materials with less than half base fill. Only pupil/nose ink and eye glints may form
one-pixel colour patches. The shared `cleanup-guards.ts` counts diagonal joins for both
avatar and pet tests. Accessory fit and eye clearance in both idle poses remain covered
by `garden.test.ts`.

## Files and PNG registration

| Art | Source or registry | PNG replacement path |
|---|---|---|
| Keeper body, faces, hair, first outfit | `sprites/art/garden-avatar.ts`, `art/avatar.ts` | `static/sprites/avatar/<slot>/<id>.png` |
| Other wardrobe parts | `sprites/art/garden-wardrobe.ts`, `content/cosmetics.ts` | Same avatar path |
| Pets and pet accessories | `sprites/art/pets.ts`, `content/pets.ts`, `content/cosmetics.ts` | `static/sprites/pets/<species>/<stage>.png`, `static/sprites/pet-accessories/<id>.png` |
| Food, toys, items, room props | `sprites/art/icons.ts`, `content/items.ts`, `sprites/room.ts` | `static/sprites/icons/<id>.png` |
| UI symbols | `sprites/art/ui.ts`, shared `art/icons.ts`, `sprites/ui-icons.ts` | `static/sprites/icons/<id>.png` |
| App icons | `sprites/art/app.svg`, `app-small.svg`, `scripts/generate-icons.mjs` | `static/icon.svg`, `static/icon-{180,192,512}.png` |
| README image | Real app captures | `docs/screens.png` |

Source paths in the table are under `src/lib/` unless given in full. PNG paths describe
the replacement convention; characters and room props use grids; icons use SVG fragments.

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

## SVG icon contract

`sprites/art/icons.ts` holds shared symbols and consumables; `sprites/art/ui.ts` holds
UI symbols. `sprites/ui-icons.ts` keeps every shipped name and its palette. SVG is an
`Art` kind beside `{ sprite }` and `{ png, w, h }`: `{ svg, symmetric? }`. The `svg` value
is a source-owned fragment, never saved text, user markup or a URL. No scripts, external
images, ids, filters or gradients. `sprites/svg.ts` supplies the outer SVG and resolves
palette tokens. Use viewBox `0 0 32 32`, a two-unit `#2b1f33` outline, rounded joins and
caps. Line-only subjects use a two-unit material core inside a four-unit ink stroke
so arrows, spokes and limbs remain visible on Night. Leave room for the outline inside the viewBox. Keep one idea and at most one
interior detail; judge 16px first. Smooth antialiasing is intentional for icons only.

Palette fills use `{primary.1}`, `{secondary.1}`, `{accent.1}`, `{hair.1}` or `{skin.1}`;
`{outline}` is fixed ink. Prefer base colours and broad shapes over shading. Garden
cream, moss, clay, muted red, river and gold live with the art, never in component CSS.
`ICON_PALETTE` supplies consumable defaults. A consumable's `tint` replaces `primary`,
including star candy; the XP star supplies Garden gold in that same channel. Keep the
shared berry/bowl/ball drawings and muted colours consistent across UI and inventory.

Front-facing symbols use centred coordinates around x=16. Repeated side details use
`mirror()` to reflect one half; circles, centred rectangles and matched contours share
that axis. Mark a finished symbol `symmetric: true` only when its colours and structure
mirror. `svg.test.ts` checks each marked icon at 16, 24 and 32px, with supersampling to
allow for curve rasterization noise. Directional drawings, diagonal seams and side-on
heads remain unmarked. Keep collar, root gap, door, hub and keyhole on the centre line.

`PixelIcon` keeps its name/art/tint/scale/label API. SVG displays directly, so scale 1,
1.5 and 2 yield crisp 16, 24 and 32px icons. Grid/PNG fallback keeps integer scaling.
`svgDocument()` is also used by the browser Figure fallback and the Node preview decoder;
`@resvg/resvg-js` rasterizes review art and exported app icons without a browser. The
compositor preserves SVG edge alpha. Keep adjacent icons decorative and give icon-only
controls names in words. A meaningful standalone `PixelIcon` receives a `label`.

The PNG decoder in `sprites/render.ts` serves the browser; `sprites/preview-png.ts`
loads the same assets for contact sheets. Regression tests compare reference PNGs with
grids, fixed pet colours, frame strips, hat clipping and accessory fits.

## Emoji display

`src/lib/display-icon.ts` maps known emoji and check/star variants to shared UI symbols.
`DisplayIcon.svelte` renders them as SVG icons and leaves unknown or custom text as text.
Catalogue values, saved habit icons, notices and party feed producers keep their original
strings. Do not migrate them to icon names. Add known aliases in this mapping, test them
in `display-icon.test.ts`, and reuse the same symbol wherever the idea appears.
The habit picker saves the original emoji value. Icons beside text are decorative.

## App icons and README captures

Run `node scripts/generate-icons.mjs` from the repo root to rebuild all app icons. The
Brambleback portrait source is `sprites/art/app.svg`: a compact side-on clay head,
cream horn, one snout and one eye, with no wing. `app-small.svg` is the dedicated 16px
drawing with a larger eye and no cheek patch. The exported `static/icon.svg` selects it
at viewports up to 16px. PNGs rasterize the larger SVG directly at their output sizes.
Manifest background/theme colours and the default browser theme colour use Night's
`bg`, `#111c31`. The browser colour follows the player's theme on server render
and after settings changes; keep a single `meta theme-color`.

`docs/screens.png` shows five phone viewports from the real app: Home, Home on a
welcome-back visit, pet care, missions and party, all in Meadow. Use an isolated dev
database, wait for fonts and sprite images, dismiss notices, and keep the exported strip
under 400 KB. One-off capture scripts belong outside the repo.

## Painted slice (phase 3, batch A)

The default outfit and Brambleback now use painted watercolour art. Other outfits,
hairstyles, faces, species and accessories retain their phase-2 drawings until their
painted batch. `painted-figures.ts` registers finished layers by their permanent ids.
A selection containing an unfinished part uses the whole pixel outfit; it stays
selectable and never combines a pixel limb with a painted body. The two grid regression
suites explicitly use `pixelAvatarFigure` / `pixelPetFigure` to keep guarding that art.
The ordinary figure functions select the painted slice. SVG icons keep their phase-2 art.

`Art` also accepts `{ painted: '/painted/top.webp', w: 400, h: 512, channel: 'top' }`.
It works for avatar parts, pets, accessories and props. `Figure.displayHeight` preserves
the old scale API while its canvas uses the painting's native pixels. Icon/prop figures
can use `uiIconFigure()` with painted art; its display height is 16 units.
The browser decodes WebP, composes with straight-alpha source-over, and caches the finished
figure. `tintPaint()` caches each source image/curated-colour pair with a WeakMap. Value
0–0.25 retains pencil ink, 0.25–0.78 moves from ink to pigment, and 0.78–1 lifts the pigment
toward paper. Alpha never changes during tinting. Fixed face marks and iris values are
separate layers, so tinting eyes leaves pupils, whites, brows and mouth intact.

Delivery files are lossless WebP under `static/painted/`; their aligned PNG masters and
generation sources are outside `static/`, in `art/painted/`. `prompts.json` records the
built-in image-generation prompts. The existing study supplies the body, face, front/back
hair and bandana; the outfit was generated with the body as its underlay. Sources have
invisible RGB cleared and faint fringe removed before resampling. Lossless WebP preserves
all remaining edge alpha; smooth browser scaling is intentional. Painted figures have
one raster pose and a CSS idle bob; reduced-motion disables it. Pixel figures keep their
old frame animation. The Node preview decoder uses the corresponding PNG master.

### Shared painted body and fit

Every avatar layer is **400 × 512**, at origin (0,0). The pose and torso silhouette in
`art/painted/masters/body.png` are fixed. Human, elf and beast use that exact layer;
`body.cat` and `body.bunny` are both saved beast choices. Ears/tail are separate paintings
and do not alter the torso. The default parts keep their shipped ids: `face.bright`,
`hair.bob`, `top.tee` (Garden shirt), `bottom.shorts`, `shoes.sneakers`. The new default
colour ids are Peach, Chestnut, Leaf, Clover, Acorn and Charcoal. Existing saved colours
are never rewritten.

| Landmark | Coordinates on the master |
|---|---|
| Head / hat contact | 200,82 |
| Neckline | 200,245 |
| Shoulders | 169,246 / 232,246 |
| Armholes | 159,277 / 243,277 |
| Wrists | 113,333 / 293,333 |
| Waist | 163,326 / 242,326 |
| Hips | 159,354 / 246,354 |
| Knees | 176,410 / 232,410 |
| Ankles | 176,477 / 235,477 |
| Soles | 176,495 / 235,495 |

`template.json` retains these landmarks. `fit.ts` states each garment's allowance,
full body coverage polygons and neckline/cuff/waist/hem/ankle seams. The body layer is
clipped under the selected garments' coverage and seams in the actual compositor.
The paintings themselves must cover meaningful body alpha (32/255) with solid cloth
(240/255) throughout each band; every row checks both edges of every connected leg or
sleeve and its interior. Raw paint outside the body stays within 16 master pixels for
the shirt, 12 for shorts and 14 for shoes. Masking cannot make missing cloth pass.
`painted.test.ts` checks all three garments on four body ids and six curated skin tones,
compares actual body-plus-garment composites to garment-only pixels in the coverage,
and cuts holes at neckline, cuffs, waistband, hips, hems and shoe tops as negative
controls. Retained hats are checked at their existing head landmark over all eight
retained hair styles. New painted hats must declare fit before registration.

### Painted Brambleback

The pet canvas is **512 × 384**, facing left, with the lowest visible pixels on
**y=350**. The Midnight tarot concept supplies all four stages: a crescent-capped
ivory and indigo egg; a seated wingless baby with enormous eyes and crescent buds;
an upright teen with longer legs, small membrane wings and crescent horns; a low,
four-pawed adult with wide open wings, a golden halo of two horns and a spade tail.
Indigo, ivory, old gold, rounded faces and large amber eyes tie the stages together.
Every future species follows this evolution rule; resized drawings do not qualify.
Lossless WebP delivery lives in `static/painted`, aligned PNG masters in
`art/painted/masters`. `brambleback-prompts.json` records the two reused concept prompts,
source hashes and alignment steps. D1 made no new generation calls. Raw sources stay in
`handoff/concept-d/source`, outside this repository. The teen is mirrored from the
concept to face left. Preparation clears faint fringe and hidden RGB, resamples with
alpha preserved, and centres each stage on the common ground line. Never repaint an
image simply to align it. `painted.test.ts` checks the canvas, margins, ground line,
transparent RGB, anchors and the adult's broader silhouette.

| Stage | Head | Neck |
|---|---|---|
| Egg (unused) | 256,110 | 256,230 |
| Baby | 212,99 | 213,205 |
| Teen | 218,74 | 225,157 |
| Adult | 200,95 | 211,187 |

`PET_ACCESSORIES_ENABLED` beside the catalogue is currently false. `petFigure` and the
painted renderer ignore saved accessory ids; pet care, shop, mission-find text and
accessory drop notices hide them. Inventories and stored pet ids stay intact. The bow
and bandana WebP/PNG files stay because the flag's enabled rendering path references
them; no UI requests them while disabled. Their 100 × 80 canvases and head (50,70) /
neck (50,28) contact points remain for re-enabling. Unpainted accessories still use the
complete pixel pet when the feature is enabled.

### Curated colour and chrome

`content/painted-palettes.ts` supplies six skin, seven hair, four eye and thirteen dye
swatches. Every old palette id remains in its catalogue and passes validation. Retired
ids resolve to the nearest curated swatch by luminance-weighted RGB distance and show
that selection in the editor. Nothing migrates in the database. The same alias applies
when an unfinished outfit uses the pixel fallback.

Cormorant Garamond and DM Sans variable Latin WOFF2 files are self-hosted with their
OFL texts in `static/fonts/`. Theme tokens supply every UI colour, the paper and two
watercolour wash endpoints, the room window and its rules. Contrast tests cover text,
stat colours, focus rings, borders and progress on every card and wash endpoint in all
six themes. New players start on `night` (Midnight tarot); saved choices stay intact.
`meadow` is the light ivory dawn variant; `sakura`, `ocean`, `ember` and `crystal` are
rose-plum, deep sea, oxblood and amethyst. Both Night and Meadow are freely selectable.
The room architecture is a shared token-coloured SVG inside a full-width arch card;
pet care uses the same architecture for its nook. The current fitted keeper and its
coverage checks stay in place for D2. The phase-2 app icon is unchanged.
