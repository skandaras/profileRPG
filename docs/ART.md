# Art contract

The keeper is B, a cel-shaded chibi with a short bob, bright amber eyes and clean dark
ink. Brambleback uses the Midnight tarot paintings. Icons use SVG; the remaining pets,
accessories and room props retain their pixel drawings. Catalogue ids are permanent.

PNG masters live in `art/painted/masters`; lossless WebP delivery lives in
`static/painted`. `art/painted/prompts.json` records the keeper's prompts, reused
sources, hashes and separation method. Raw generations and one-off preparation/review
scripts live outside the repository in `handoff/k/`. The approved B sources remain in
`handoff/keeper-b/`. Run `SPRITE_PREVIEW=1 npx vitest run src/lib/sprites/preview` and
inspect all eight sheets in `test-results/sprites/`, on light and dark surfaces.

## Keeper template and wardrobe

One human body, one face and one bob serve every save. All layers are **400 × 704** at
origin (0,0), with pivot **570** and display height **44** in the existing scale API.
The canvas matches the approved B sample; Home at scale 4.5 displays it at 112.5 × 198
CSS px, beside the unchanged 145.07 × 108.8 baby Brambleback. The ground is row 683.
The head is large and the body short. No runtime placement offsets or pixel-avatar
fallback remain. The browser scales paintings smoothly, with a CSS idle bob disabled
by reduced motion. `paintFigure` and the Node preview use the same composite.

Layers: body/face at depth 10 (`keeper-light` or `keeper-deep`), one fixed-colour whole
outfit at 30, the bob value layer at 50 (`keeper-bob`). Skin paintings share one alpha
and fixed facial strokes; eyes, brows and mouth remain clear on both. Only the bob is
tinted, through `tintPaint`'s cached ink → pigment → highlight ramp. Ink darkens with
dark pigment, and tinting preserves every alpha value. Transparent pixels have zero RGB.

`template.json` names the head, neckline, shoulders, armholes, wrists, waist, hips,
knees, ankles and soles. Every outfit is painted on the same approved B underlay.
All four sources use the original's shared crop/scale/origin. Source ink and cel folds
are retained while separating skin and clothing; enclosed holes and detached flecks
are removed. Trousers carry their original row contours to the shared calves. Small
band-edge gaps carry adjacent source pigment; no renderer offset repairs a garment.

Whole outfits use the **existing `parts.top` slot**, without a schema change:

| Stored top | Complete outfit |
|---|---|
| `top.tee` | 01 Collar and shorts (default) |
| `top.sweater` | 02 Jumper and skirt |
| `top.hoodie` | 03 Hood-down jacket |
| `top.tunic` | 04 Starry overall dress |

All four are free starter choices. Each includes its top, bottom and shoes in fixed
ivory, navy and gold. The stored bottom, shoes, eye colour and dye slots are ignored
by rendering. The editor and onboarding expose only two skins, five hair colours and
four outfits. Existing unused slot data may stay in a save; rendering does not rewrite it.

`keeperLook()` maps old saves before constructing their figure:

- Bodies → human; faces → Bright; hair styles → bob. Features, hats and accessories
  disappear. Their catalogue entries retain ids, names and unlock metadata, marked
  `retired`; their paintings and pixel drawings are removed.
- Skin: Porcelain, Peach and Honey → Light (`peach`); Tan, Umber and Deep → Deep (`deep`).
- Hair: Ink/Black (`ink`), Cocoa/Dark brown (`cocoa`), Chestnut (`chestnut`), Honey blonde
  (`honey`) and Ginger/Auburn (`ginger`) stay. Bubblegum, Lavender, Seafoam and Silver
  → Honey blonde; Sky → Chestnut. These are nearest in luminance-weighted RGB to the
  kept B pigments, using the previous curated pigment where one existed.
- Tops: Tee, Tank and Sailor → 01; Sweater → 02; Hoodie, Kimono and Vest → 03;
  Tunic → 04. Bottoms, shoes and decoration do not change that choice.
- Eye colours → the fixed amber eyes; all dyes → the selected outfit's fixed colours.
  Every old colour id remains valid and retired in its original catalogue.

`getItem`/`allItems` retain retired inventory metadata. `availableItems` filters them
from shop/unlock surfaces; purchases reject them. Missions replace retired clothing
and dye drops with 10–20 GP at the original weights. Owned items remain in inventories.
No catalogue id, database row or migration is removed.

## Fit guards

`fit.ts` declares each outfit's independent full coverage polygons and neckline, cuff,
hem and footwear seam bands. Outside allowances are 34, 40, 28 and 46 master pixels
for outfits 01–04, allowing sleeves and skirts. The source layer must cover body alpha
≥32 with garment alpha ≥240 across the entire band, both edges of every connected
leg/sleeve row and its interior. The actual compositor clips body paint in those same
regions. Source validation must pass before composite equality can pass.

`painted.test.ts` checks every outfit on both skins (**eight combinations**), then compares
body-plus-cloth with cloth alone throughout coverage in the real renderer. Negative
controls narrow a garment by eight pixels, cut every named seam, introduce enclosed
transparent holes, add misplaced paint and detach a tiny fleck. `paintDefects` rejects
enclosed clear pixels and pigment components smaller than six pixels. Tests also check
native alignment, hidden RGB, preserved hair alpha, every saved palette id, and exact
pixel equality between a saved elf/glasses/crown/cape/overalls avatar and its mapped look.

## Remaining pixel pets and props

Pixel pets use 32 × 32 frames with feet ending on row 30 (outline may use row 31),
pivot row 24. Pet accessories use 12 × 8 with anchors below; room mess uses 12 × 12;
the bed uses 28 × 10. All are palette-indexed grids under `sprites/art/`.

Use a one-pixel outline `#2b1f33` and pupils `#1a1322`, broad even stair steps and two
flat shades for tiny materials (up to three on larger shapes). Base colour fills most
of each material; connected highlights sit upper left and a connected shadow below or
right. Avoid speckle, dithering, detached pixels and single-pixel colour patches except
pupil/nose ink and eye glints. Alpha is fully clear or opaque, without antialiasing.
Render pixel art at integer scales with nearest-neighbour sampling. A single pose gets
an automatic second idle frame above its pivot; declared multi-frame art holds shorter
layers on their last frame. Room props and icons stay still.

Fixed material colours live with the art. Pet PNGs carry final colours and declare
`fixedColors: true`; accessories still recolour through `REFERENCE_PALETTE`. Fixed white
`#fffefd` differs from secondary light `#ffffff`, keeping soles and eye glints fixed.
An Art can be a sprite, PNG, trusted SVG fragment or painted WebP; a painted prop
retains display height 16 while using its native canvas.

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
one-pixel colour patches. The shared `cleanup-guards.ts` counts diagonal joins for pet tests. Accessory fit and eye clearance in both idle poses remain covered
by `garden.test.ts`.

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
grids, fixed pet colours, frame strips and pet accessory fits.

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

## Chrome

Cormorant Garamond and DM Sans variable Latin WOFF2 files are self-hosted with their
OFL texts in `static/fonts/`. Theme tokens supply every UI colour, the paper and two
watercolour wash endpoints, the room window and its rules. Contrast tests cover text,
stat colours, focus rings, borders and progress on every card and wash endpoint in all
six themes. New players start on `night` (Midnight tarot); saved choices stay intact.
`meadow` is the light ivory dawn variant; `sakura`, `ocean`, `ember` and `crystal` are
rose-plum, deep sea, oxblood and amethyst. Both Night and Meadow are freely selectable.
The room architecture is a shared token-coloured SVG inside a full-width arch card;
pet care uses the same architecture for its nook. The chibi keeper shares a ground line with Brambleback. The phase-2 app
icon is unchanged.
