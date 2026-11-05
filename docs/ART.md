# Art contract

The Wayfarer cast uses angular silhouettes, broad gouache shadow planes, irregular dark
ink contours and a small earth-and-jewel palette. Slay the Spire informed the graphic
fantasy direction; the keeper and all six familiar designs are original. Faces stay
small and expressive. Clothing is asymmetric and practical: scarves, weathered coats,
boots, satchels and field journals. Creatures should feel loyal and a little strange.

The direction study for this pass is in `art/wayfarer/direction.png`. Production art
is in transparent PNG atlases and a painted study under `static/painted/`. Source
provenance and hashes are recorded in `art/wayfarer/sources.json`. Keep these originals unchanged; make a new
asset revision when redrawing. There are no external handoff directories needed to
reproduce the current app.

## Keeper

`wayfarers.png` has four columns and two rows, with complete dressed characters.
Columns are Wayfarer, Archivist, Ranger and Lamplighter. Rows are Light and Deep skin.
The neutral gray hair in each source is tinted by the renderer. Two skin tones and
five hair colours remain available in onboarding and the wardrobe.

| Stored top id | Outfit | Source column |
|---|---|---|
| `top.tee` | Wayfarer: ochre scarf and petrol coat | 0 |
| `top.sweater` | Archivist: plum robe and field journal | 1 |
| `top.hoodie` | Ranger: moss cloak and leather layers | 2 |
| `top.tunic` | Lamplighter: indigo coat and brass lantern | 3 |

The atlas is 1774 × 887, so cell boundaries are rounded, not truncated. Each cutout is
centred on a 224 × 384 canvas, with visible height up to 352 and feet ending at row 371.
The existing display-height API remains 44. Full dressed paintings replace independent
body/clothing layers, so there is no runtime garment clipping or fitting-mask repair.

`preparePaint` only tints neutral pixels in the upper 15% of the cutout. Warm skin,
dark facial ink and the whole outfit remain painted. Tinting never changes alpha.
Check all forty skin/hair/outfit combinations on both light and dark surfaces.

## Familiars

`familiars.png` is 1024 × 1536. Its columns contain egg, baby, teen and adult; rows
contain the six species below. Every age has its own drawing and growing anatomy.

| Saved species id | Display name | Visual identity |
|---|---|---|
| `emberkit` | Brambleback | Russet thorn dragon; branching gold horns and broad adult wings |
| `puddlefin` | Brookbell | Slate-teal river seal; ivory chest and a growing shell collar |
| `mossling` | Cloverruff | Long-eared moss hound; clover ruff and fern tail |
| `pebblet` | Cairnback | Slate tortoise; layered rock and amber crystals |
| `fluffle` | Cloudwool | Angular cream fleece; gold spiral horns |
| `glimmerwing` | Lamplume | Velvet-plum moth; amber lantern wing markings |

Some horns, muzzles and wings cross the atlas's nominal column or row boundaries.
Use the measured `PET_REGIONS` in `painted-figures.ts`, never a uniform grid crop.
Each rectangle includes a three-pixel clear gutter around the complete silhouette.
When replacing the atlas, remeasure all 24 regions and review every stage.

The output canvas is 256 × 224, with feet or egg bottoms ending on row 211. Maximum
visible heights are 112, 140, 176 and 200 for egg through adult. Width is also constrained
to preserve wide wings. Display height is 36. Hero and pet share the ground line in
Home; the same figures appear in onboarding, pet care, missions and the party.

## Rendering and validation

`painted.ts` selects a source region, finds its visible bounds, centres and scales it
onto the output canvas. Bilinear sampling uses premultiplied alpha: hidden background
RGB must never produce dark or coloured halos. The source atlas is never mutated.
Prepared cutouts are cached by atlas identity, region, output dimensions and hair colour.
Node previews and the browser call the same compositor on the same production files.

`CHROMIUM_PATH=/usr/bin/chromium npm run review:assets` builds a labelled, printable
inventory in `test-results/assets/`: `overview.png`, an 11-page A3 `asset-review.pdf`,
a self-contained `asset-review.html`, individual page PNGs and `inventory.json`.
It covers all 40 keeper combinations and 24 pet stages on light and dark surfaces,
69 interface symbols, food and toys, room props, the disabled accessory icons, themes,
fonts and application icons. The exporter checks every sheet fits its page. It uses
existing assets and the production compositor; it does not redraw the illustrations.
Omit `CHROMIUM_PATH` when using Playwright's installed browser.

Painted figures use smooth browser scaling and a restrained CSS idle motion. Reduced
motion disables animation. Keep shadows and stage scenery out of the atlas; the UI's
theme tokens supply the surrounding architecture and surfaces.

Run:

```sh
npm run lint && npm run check && npm test
SPRITE_PREVIEW=1 npx vitest run src/lib/sprites/preview
npm run build && CHROMIUM_PATH=/usr/bin/chromium npm run test:ui
```

Contact sheets in `test-results/sprites/` show the full cast on light and dark surfaces:
`wayfarers-light.png`, `wayfarers-dark.png`, `familiars-light.png` and
`familiars-dark.png`. Inspect those and the browser captures. Tests check all production
cutouts, shared ground and margins, distinct portraits, hair alpha and outfit isolation,
legacy ids, atlas boundaries, missing cells, alpha compositing and stray sprite fragments.

## Saved data and retired items

Catalogue ids are permanent. `keeperLook()` maps old body, face, hair and decorative
choices to the current traveller without rewriting a save. Old top ids map to the four
outfits above. The stored `hair.bob` slot now displays the swept crop; skin and hair ids
retain their existing mappings in `painted-palettes.ts`. Unused eye and dye choices
remain valid metadata.

Retired cosmetics stay resolvable in inventory and cannot be purchased. Missions pay
coins in place of retired clothing and dye drops. No database migration, pet id, owned
item or player progress is removed by an art revision.

Pet accessories remain disabled by `PET_ACCESSORIES_ENABLED`. Saved accessory ids and
inventory metadata remain intact, but no old accessory art is overlaid on the new cast.
The tiny palette-indexed accessory icons are retained for that metadata. Re-enabling
accessories requires new fitted artwork and tests for the new silhouettes.

Dedicated quest-region illustrations have not been added. The eight expedition cards
currently use the shared interface symbols. These and the fitted accessories are the
remaining art work if those areas need a fuller illustrated treatment.

## Icons, props and application surfaces

UI icons remain trusted source-owned SVG fragments at viewBox 0 0 32 32. No scripts,
external URLs or user markup enter `SvgArt`. Decorative icons are hidden from assistive
technology; standalone icons receive a label. `DisplayIcon` maps known saved emoji to
the shared symbols while preserving unknown custom text.

Food, toys and room art share the cast's gouache shapes, ink contours and earth-and-jewel
palette. `provisions.png` is a 1536 × 1024 atlas, four columns by two rows: wild berries,
kibble, fish, honey cake, star candy, ball, yarn and the dragon plush. `provisionArt()`
maps the existing eight inventory ids to cells, on 144 × 144 output canvases with a
128-pixel visible-height limit and ground at 136. Final painted colours replace tinting;
saved tint metadata remains valid. Atlas-cell coordinates form part of icon cache keys.

`room-props.png` holds the basket bed, dust and fallen leaf, biscuit crumbs, banana peel,
muddy bootprint and wool sock. The basket crosses a nominal cell edge, so use measured
`ROOM_REGIONS` from `painted-props.ts`. The bed uses a 256 × 192 canvas and ground at 176;
other props use 144 × 144 and ground at 136. Each output has clear margins. The pet bed
appears behind the companion, and daily room clutter uses the same painted renderer.
Old room grids and physical-item SVG drawings have been removed.

`study-nook.png` is a 1536 × 1024 opaque painting shared by Today and pet care. It has an
arched window, worn wood, books, maps and a lantern, with open floor for separately
composited figures and props. `TarotArch` retains its shared component API and crops the
painting from the centre bottom. The scene label stays on an opaque theme surface.

Only the disabled accessory reference icons retain palette-indexed drawings; their
symmetry and reference-colour tests stay. Painted item/prop tests cover distinct cutouts,
transparent margins, preserved colours, light/dark compositing and source-file hashes.

Run `node scripts/generate-icons.mjs` to rebuild the SVG-derived app icons. Cormorant
Garamond and DM Sans are self-hosted with OFL licences in `static/fonts/`. Theme colours,
focus rings and contrast checks remain shared by all six themes. New players start on
Night; existing theme choices stay intact.
