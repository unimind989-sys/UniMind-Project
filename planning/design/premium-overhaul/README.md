# Premium overhaul: two directions (WP03-T18)

Static mockups for Ahmed's direction choice. Not product code. The [task record](../../tasks/wp03-t18-premium-direction.md) holds the diagnosis, decisions and status.

Run `node planning/design/premium-overhaul/serve.mjs` and open <http://127.0.0.1:3104/>. Each direction file shows one screen at a time with a Light/Dark switch; `?screen=chat&theme=dark` deep-links.

## Brief

- **Subject:** a study companion for Egyptian university students, first Year 1 Medicine at Zagazig. Students ask questions of their own faculty's approved material (lecture handouts, practical recordings, professors' voice notes) and check every answer against the exact page or timestamp. They study on 360 to 430px phones, in English, Arabic or both.
- **Primary job:** make the next study action obvious, make the answer the biggest thing on the screen, and make its evidence one tap away.
- **Fixed fingerprint (Ahmed, 17 Oct 2026):** the name UniMind, the Open Folio logo (never mirrored, `dir="ltr"`), the slogan "Study deeper / Go further." in English, and the blue family. The logo palette is the brand palette: Night `#0c1823`, Paper `#ecf3f9`, Cobalt `#3977f7`. The logo lettering derives from Manrope 650, so Manrope stays the interface face.
- **Kept rules:** every flow and safety rule in `DESIGN.md`; no invented progress, streaks or metrics (material count and freshness are real data); AA contrast in both themes; 44px targets; visible focus; RTL with isolated Latin terms; reduced motion.

## What both directions retire

| Today | Both directions |
| --- | --- |
| Muted product blue `#2458b8`, unrelated to the logo | The logo's Cobalt, with a darker text-safe step for small text and fills under white text |
| Grey canvas, white box, 1px border on everything | Surfaces with distinct jobs and real depth where layering is real |
| 26px titles, everything else 14 to 16px | A real scale: display, page, section, body, meta, with weight contrast |
| ~320px of stacked chrome before content | One navigation layer that also carries the current subject |
| Raw `<details>` triangles, native spinners, four button styles | One component kit: segmented control, chip, sheet, menu, primary/secondary/quiet buttons |
| Middle-dot meta strings, arrows appended to links | Structured metadata and plain verbs |
| Test-like fixture names | Believable invented material (below) |

## Direction A: Margin

**Idea:** read like the material, check like a scholar. Answers are set as pages with a margin, the way students annotate a printed handout. Evidence lives in the margin beside the claim it supports. The interface recedes into Night ink; the material is the hero.

**Color**

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| night | `#0c1823` | `#0c1823` | Navigation page, ink |
| desk | `#ecf3f9` (Paper) | `#0a121b` | Canvas behind sheets |
| sheet | `#ffffff` | `#111c28` | Reading and working surface |
| margin | `#e2ebf6` | `#16243a` | Evidence column, annotations |
| cobalt | `#3977f7` | `#6d9cff` | Highlighter, marks, focus |
| cobalt-ink | `#1d4fd1` | `#9bbcff` | Links, primary fill, small blue text |
| graphite | `#46566b` | `#a3b3c6` | Secondary text |

**Type:** Manrope for interface and display (800 display, 700 headings, 500/600 UI). Material is set in book faces so reading looks different from interface: Source Serif 4 for English answers and excerpts (18px/1.65), Noto Naskh Arabic for Arabic (20px/1.9). Arabic interface in Noto Sans Arabic.

**Signature:** the cobalt highlighter. A supported sentence carries a soft cobalt highlight and a superscript number; the margin note with the same number shows the excerpt, its page or timestamp, and a professor's exam-emphasis note when one is tagged.

**Layout**

```text
Desktop                                           Phone
+--------+----------------------------------+     +----------------------+
| NIGHT  |  desk                             |     | NIGHT  Anatomy  ...  |
| logo   |  +---------------------+--------+ |     | Materials Chat Studio|
| Study  |  | sheet: question     | margin | |     +----------------------+
| Subj.  |  | answer in serif     | [1] p14| |     | sheet                |
| ------ |  | highlighted claim(1)| [2]18:42 |     | question             |
| Anatomy|  | ...                 | Dr.Hala| |     | answer (serif)  ¹ ²  |
|  Mater.|  +---------------------+--------+ |     | [Sources 3] bar      |
|  Chat  |  | composer                      | |     | composer             |
|  Studio|  +-------------------------------+ |     +----------------------+
+--------+----------------------------------+     | Study Subjects Me    |
                                                  +----------------------+
```

Left-aligned throughout. The Night rail is the left page of the folio: global destinations on top, then the current subject's own pages, so the top bar, breadcrumb, back link and tab row disappear.

## Direction B: Cobalt

**Idea:** big, sure and quick. The logo's two pages become the two planes of the interface: Night for orientation, Cobalt for the one thing to do next. Everything else is clean paper. Type works at extremes, very large display against compact interface text. Shapes borrow the folio page's curved top edge.

**Color**

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| night | `#0c1823` | `#050b12` | Orientation planes, headers |
| paper | `#ecf3f9` | `#0a1520` | Canvas |
| surface | `#ffffff` | `#102030` | Cards, answer surface |
| cobalt | `#3977f7` | `#5a8dff` | Brand planes with large type only |
| action | `#2a62e0` | `#8fb2ff` | Buttons and small blue text (AA) |
| ink | `#0c1823` | `#ecf3f9` | Text |
| secondary | `#4b5b6e` | `#a6b5c7` | Secondary text |
| line | `#d4dfeb` | `#203347` | Separators |

**Type:** Manrope only, at extremes: display 800 with tight tracking (72 to 120px landing, 44 to 56px page titles), interface 15 to 16px at 500/600. Arabic in Noto Sans Arabic 700/800 for display.

**Signature:** the open folio as layout. Night and Cobalt planes sit side by side like the logo's pages; the resume card and the current subject cover use the page's curved top edge.

**Layout**

```text
Desktop                                           Phone
+----------------------------------------------+  +----------------------+
| NIGHT bar: logo  Study  Subjects     EN  (S) |  | NIGHT  Anatomy       |
+----------------------------------------------+  | (Materials|Chat|...) |
| NIGHT subject band: "Anatomy" (huge)         |  +----------------------+
|  ( Materials | Chat | Studio | Quiz )        |  | question bubble  ->  |
+---------------------------------+------------+  | answer card          |
|   question bubble        ->     | Sources    |  |  [1 p14] [2 18:42]   |
|   answer card (white)           | panel      |  | Dr. Hala (night)     |
|    chips [1 p14] [2 18:42]      |            |  | ( Ask about... (o) ) |
|   ( Ask about Anatomy ...  (o)) |            |  | Study Subjects Me    |
+---------------------------------+------------+  +----------------------+
```

## Review against generic defaults

- **A** risks the editorial "broadsheet" look and the cream-and-serif tell. Changed: the paper is the logo's cool `#ecf3f9`, never cream; the serif is used only for material, never for headings; sheets have soft radius and real elevation instead of hairline columns.
- **B** risks the SaaS card kit and the dark-plus-one-bright-accent tell. Changed: light-first with Night as a structural plane rather than a black page; no gradients; radius follows hierarchy (cover 24, panel 14, chip full); card sizes differ by importance; Cobalt carries only large type.
- **Both** avoid all-caps eyebrows, middle-dot meta strings, arrows appended to button text, monospace labels and decorative numbering (onboarding is a real sequence and may be numbered).

## Screens in each mockup

1. Landing hero (desktop, first viewport).
2. Study Shelf (desktop and phone).
3. Chat with evidence (desktop).
4. Chat (phone, English) and Chat (phone, Arabic RTL).
5. Admin decision queue (desktop).

## Content pack (invented, believable)

- **Student:** Samir Hassan, Zagazig University, Faculty of Medicine, Year 1, Term 1.
- **Subjects:** Anatomy (14 materials, updated 2 days ago), Physiology (9, today), Biochemistry (11, last week), Pathology (6, 3 days ago), Pharmacology (4, yesterday).
- **Resume:** Anatomy chat "Brachial plexus injuries", last asked Tuesday 9:40 pm.
- **Question:** "What happens if the upper trunk of the brachial plexus is injured?"
- **Answer:** An upper trunk injury damages the C5 and C6 roots: Erb's palsy. It usually follows a fall on the shoulder or a difficult delivery that pulls the head away from the shoulder [1]. The muscles supplied by C5 and C6 weaken: deltoid, supraspinatus, infraspinatus, biceps and brachialis [1]. The arm hangs adducted and medially rotated, with the forearm extended and pronated, the "waiter's tip" position [2]. Sensation is lost over the lateral arm and forearm [1].
- **[1]** Lecture 6 handout, Brachial plexus. PDF, page 14. "Injury to the upper trunk (C5, C6) produces Erb–Duchenne paralysis, commonly from excessive separation of the head and shoulder."
- **[2]** Practical 3, Axilla and arm. Recording, 18:42. "Look at the position: arm medially rotated, forearm pronated, palm facing backwards. That's the waiter's tip."
- **Professor insight:** Dr. Hala Mansour, exam emphasis (voice note, 3:15): "Erb's palsy comes almost every year. Know the muscles and the position."
- **Evidence:** supported by 3 materials.
- **Follow-ups:** Compare with Klumpke's palsy; Make flashcards from this answer; Quiz me on the upper trunk.
- **Earlier sessions:** Rotator cuff muscles (Monday); Boundaries of the axilla (9 Oct).
- **Privacy line:** "The UniMind team can review chats to improve answers. Change this in Privacy."
- **Arabic question:** "إيه اللي بيحصل لو الجذع العلوي للضفيرة العضدية اتصاب؟"
- **Arabic answer:** إصابة الجذع العلوي تؤثر على الجذرين C5 وC6، وتُعرف بشلل إرب. تحدث غالبًا بعد سقوط على الكتف أو ولادة متعسرة تُبعد الرأس عن الكتف [1]. تضعف العضلات التي يغذيها الجذران: الدالية وفوق الشوكة وتحت الشوكة وذات الرأسين والعضدية [1]. لذلك يتدلى الذراع مقرّبًا ومدوّرًا للداخل، والساعد ممدود ومكبوب، وهو وضع «بقشيش النادل» [2].
- **Arabic labels:** المذاكرة، المواد، الإعدادات؛ مصادر المذاكرة، المحادثة، الاستوديو، الاختبار؛ علم التشريح؛ محاضرة 6: الضفيرة العضدية، صفحة 14؛ العملي 3: الإبط والذراع، 18:42؛ د. هالة منصور، تركيز امتحاني.
- **Admin queue (Ahmed, admin):** Publish Physiology for Zagazig Medicine Year 1 Term 1 (ready: 9 active sources); Quarantine failed source "Practical 4 recording" (audio unreadable after 31:20); Unlock cohort Zagazig Medicine Year 1 Term 1 (waiting for second admin, Ziad); Request retry for "Biochemistry lecture 3" (processing failed twice); Place raw-data hold on "Pathology practical slides" (rights review); Deactivate source version "Anatomy handout v1" (replaced by v2). Counts: Needs you 6, Waiting for second admin 1, Blocked 1, Done this week 3.
