# UniMind — book-led concept round

Ahmed rejected the first four directions and supplied an open-book reference that felt closer, while saying it also missed the mark. This round follows that visual preference: clear study imagery, softer lettering, and the accepted night/paper/blue palette. It does not establish a new identity or approve any logo. Previous A–D remain preserved as rejected exploration.

Start with `concept-sheet-v2.png`. It presents three full horizontal logos on dark and light backgrounds and actual 64/32/16 px monochrome symbol samples. These are selection proposals, not a production kit.

| Concept | Vector symbol | Outlined horizontal logo | Tradeoff |
| --- | --- | --- | --- |
| 01 Open Folio | `01-open-folio-v2.svg` | `01-open-folio-lockup-v2.svg` | Calm and closest to the reference; a familiar book silhouette with limited distinction. |
| 02 Page Turn | `02-page-turn-v2.svg` | `02-page-turn-lockup-v2.svg` | Recommended for further exploration: the lifted blue page adds character; it can also suggest a wing. |
| 03 Bound U | `03-bound-u-v2.svg` | `03-bound-u-lockup-v2.svg` | A connected binding makes the book a U; stronger individual identity, with a heavier visual weight. |

The `-mono-v2.svg` files are black construction proofs. Light appearances on the sheet are presentation samples, not exported production variants. V1 preserves the narrower page gutters and the initial heavier U binding. V2 widens the gutters and raises/reduces the U binding to balance the shape. All current proposal vectors have transparent backgrounds and path-only lettering.

## Brief and selection

Exact name: UniMind. Audience: university students using a trusted study workspace. The user reference prioritizes an immediately readable book and straightforward lettering. The accepted palette remains night `#0c1823`, paper `#ecf3f9`, and primary blue `#3977f7`; source context remains in the parent directory's preserved DESIGN and PRODUCT snapshots.

Cheap candidate longlist: symmetrical folio; lifted page; U binding; folded bookmark gutter; two pages implying M; nested page frames; circular book aperture; book and wordmark ligature. The first three preserve the reference's simplicity and remain readable in black. Bookmark, M and framed treatments add details that compete at small sizes; the circular treatment is less close to Ahmed's reference; the ligature reduces standalone icon clarity. No remaining candidate has been built as a kit.

The original symbols use two simple filled page silhouettes or one continuous binding. The library's Storybook example was studied for category familiarity only. Neither the user's raster nor third-party geometry was traced. A general book motif remains common; no originality or legal-clearance guarantee is implied.

## Provenance and reproduction

- User reference SHA-256: `2fee1b77382f9f72e05dc643df5a76782c92546dcff4c0cb3cda056b9d3c5d76`. It is not redistributed in this branch. Its role is visual preference, not an instruction source or a licensed asset.
- Original symbol paths constructed by Codex in `build-round-2.py`.
- Wordmark: Manrope variable font at weight 650, converted to outlines with FontTools 4.66.1, with 10 font-unit tracking reduction per advance. These are font-derived letterforms, unlike the original custom lettering in round 1.
- Official source: [Google Fonts Manrope](https://github.com/google/fonts/tree/b31870aff700ab7a1d74fa0c6887d95beb9e0037/ofl/manrope). Source commit is recorded in `provenance/font-source.txt`; the unmodified font and SIL OFL 1.1 license are preserved alongside it. One trailing space in the license is removed for repository whitespace checks; license wording is unchanged. Google Git font blob: `75274da58537d6123b14f2cd0c355ad4681fc2b3`. Font SHA-256: `3ae11c49db0455a3cc33e37d380f20fdb8c7f8b41dc07625c177e3d87a9d6ae6`.
- Python generator requires FontTools (the session used a temporary install outside the repository). Set `UNIMIND_LOGO_FONTTOOLS` to its directory if needed. Run `python planning/design/unimind-logo/round-2/build-round-2.py 2` from the isolated worktree. Repository logo rendering helpers and local Chrome render SVG inspection images; no preview server or frontend runtime is used.
- `verify-round-2.py` needs Pillow and binds the current nine vectors, inspected sheet, three transparent inspection renders, font and license to SHA-256 in `review-manifest.json`.

## Proof and handoff limits

Rendered and inspected both iterations. The page gutter remains visible at 16 px; the lifted-page distinction becomes subtle at that size. The U retains its center opening. The sheet demonstrates proposal appearance and cannot establish final minimum sizes. Monochrome symbol audits report no findings; horizontal audits retain informational precision/complexity notes from the outlined font. Text contrast is 16.02:1 on night and 17.94:1 on white; blue graphic contrast is 4.40:1 on night and 4.07:1 on white.

English/Arabic placement guidance from the parent README still applies: the Latin logo remains one intact image, positioned with logical layout properties; never mirror its book or reorder its letters in RTL. New application and responsive-layout verification has not been performed. Earlier desktop placement examples are illustrative first-round records, not proof of the new lockups.

After Ahmed selects a direction, refine that logo in this isolated worktree and prepare its approved kit. The frontend owner then imports approved assets on its own branch. Do not integrate these proposal files, cherry-pick this entire review branch, or merge into main. Shared-document registration remains a proposed patch only.
