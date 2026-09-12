# WP03 Study Shelf production-asset manifest

The approved mock is `.impeccable/mocks/decision/wp03-study-shelf.webp`. The generated atlases are retained only as review sources under `.impeccable/review/sources/`; no mock crop ships as a product asset.

## Produce

| ID                 | Source crop          | Output path                                        | Strategy                                                 | Dimensions / format | Transparency | Deviation                                                                | QA       |
| ------------------ | -------------------- | -------------------------------------------------- | -------------------------------------------------------- | ------------------- | ------------ | ------------------------------------------------------------------------ | -------- |
| cardiovascular     | Atlas A, upper-left  | `public/images/study-shelf/cardiovascular.png`     | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | None material                                                            | accepted |
| respiratory        | Atlas A, upper-right | `public/images/study-shelf/respiratory.png`        | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | None material                                                            | accepted |
| cell-biology       | Atlas A, lower-left  | `public/images/study-shelf/cell-biology.png`       | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | None material                                                            | accepted |
| clinical-medicine  | Atlas A, lower-right | `public/images/study-shelf/clinical-medicine.png`  | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | None material                                                            | accepted |
| renal              | Atlas B, upper-left  | `public/images/study-shelf/renal.png`              | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | None material                                                            | accepted |
| gastrointestinal   | Atlas B, upper-right | `public/images/study-shelf/gastrointestinal.png`   | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | None material                                                            | accepted |
| biochemistry       | Atlas B, lower-left  | `public/images/study-shelf/biochemistry.png`       | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | None material                                                            | accepted |
| obstetrics         | Atlas B, lower-right | `public/images/study-shelf/obstetrics.png`         | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | Educational phantom appearance only; never presented as patient evidence | accepted |
| physiology         | Atlas C, upper-left  | `public/images/study-shelf/physiology.png`         | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | None material                                                            | accepted |
| pathology          | Atlas C, upper-right | `public/images/study-shelf/pathology.png`          | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | Synthetic histopathology plate; not clinical evidence                    | accepted |
| pharmacology       | Atlas C, lower-left  | `public/images/study-shelf/pharmacology.png`       | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | None material                                                            | accepted |
| microbiology       | Atlas C, lower-right | `public/images/study-shelf/microbiology.png`       | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | Synthetic microscopic plate; not clinical evidence                       | accepted |
| internal-medicine  | Atlas D, upper-left  | `public/images/study-shelf/internal-medicine.png`  | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | Unlabelled synthetic diagnostic sheet; not patient data                  | accepted |
| surgery            | Atlas D, upper-right | `public/images/study-shelf/surgery.png`            | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | None material                                                            | accepted |
| pediatrics         | Atlas D, lower-left  | `public/images/study-shelf/pediatrics.png`         | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | Synthetic teaching mannequin only; no real person                        | accepted |
| emergency-medicine | Atlas D, lower-right | `public/images/study-shelf/emergency-medicine.png` | Reference-led clean generation, then exact quadrant crop | 768×512 PNG         | Opaque       | Blank displays and no identifying information                            | accepted |

Every output carries the exact atlas-generation prompt in embedded PNG metadata. The prompts are also stored in `.impeccable/work/synthetic-medical-atlas-{a,b,c,d}.prompt.txt`. The contact-sheet comparison is `.impeccable/review/assets-contact-sheet.png`.

## Direct

None. The approved comp is reference-grade and no crop from it ships.

## Semantic

| ID              | Implementation                                                                           | Notes                                                                           | QA       |
| --------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------- |
| shell-and-rails | Semantic navigation, main, sections, lists, buttons, links, status text, and project CSS | CSS owns layout, clipping, radii, border, focus, responsive overflow, and state | accepted |
| icon-system     | Small authored inline SVG set with one stroke language                                   | No Unicode or raster icons                                                      | accepted |
| localized-copy  | Typed dictionaries, one active interface locale, and `lang`, `dir`, and `bdi` boundaries | English technical names stay isolated within Arabic content                     | accepted |

## Execution order

Generate Atlases A–D from the approved comp → retain source atlases under review → crop sixteen production plates → embed prompts → inspect combined contact sheet → compose in semantic cards.

## Blockers

None.

## Assumptions

The imagery is illustrative synthetic content for WP03-T01 only, not real catalog availability, approved study material, or clinical evidence.
