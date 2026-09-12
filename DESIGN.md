---
version: alpha
name: UniMind
description: A bilingual source-grounded study interface organized as calm academic shelves.
colors:
  night-canvas: "#0c1823"
  deep-night: "#07131e"
  shelf-surface: "#142132"
  raised-surface: "#1a293d"
  focused-surface: "#2a3b51"
  active-surface: "#1e3557"
  paper-white: "#ecf3f9"
  secondary-ink: "#c8d1d8"
  muted-ink: "#9aa8b8"
  cobalt-action: "#3977f7"
  cobalt-focus: "#336ae2"
  ready-mint: "#79dfb1"
  ready-field: "#10292a"
  cool-separator: "#253a55"
  on-action: "#ffffff"
typography:
  display:
    fontFamily: "Manrope, Noto Sans Arabic, sans-serif"
    fontSize: "clamp(2.15rem, 3vw, 2.65rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, Noto Sans Arabic, sans-serif"
    fontSize: "1.18rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Manrope, Noto Sans Arabic, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 720
    lineHeight: 1.2
  body:
    fontFamily: "Manrope, Noto Sans Arabic, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Manrope, Noto Sans Arabic, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.4
  arabic-title:
    fontFamily: "Noto Sans Arabic, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
  arabic-body:
    fontFamily: "Noto Sans Arabic, sans-serif"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  control: "0.75rem"
  card: "0.875rem"
  pill: "999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.5rem"
  6: "2rem"
  7: "3rem"
components:
  workspace-action:
    backgroundColor: "{colors.cobalt-action}"
    textColor: "{colors.on-action}"
    typography: "{typography.label}"
    rounded: "0.65rem"
    padding: "0.65rem 0.8rem"
    height: "3.35rem"
  workspace-action-disabled:
    backgroundColor: "{colors.cobalt-action}"
    textColor: "{colors.on-action}"
  search-field:
    backgroundColor: "{colors.raised-surface}"
    textColor: "{colors.paper-white}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 1rem 0 0.9rem"
    height: "2.85rem"
  product-nav-current:
    backgroundColor: "{colors.active-surface}"
    textColor: "#8db4ff"
    rounded: "{rounded.control}"
    padding: "0.65rem 0.75rem"
    height: "4.25rem"
  locale-option:
    backgroundColor: "transparent"
    textColor: "{colors.secondary-ink}"
    rounded: "{rounded.pill}"
    padding: "0.2rem"
    height: "2.2rem"
  locale-option-selected:
    backgroundColor: "{colors.active-surface}"
    textColor: "{colors.paper-white}"
  unit-card:
    backgroundColor: "{colors.shelf-surface}"
    textColor: "{colors.paper-white}"
    typography: "{typography.title}"
    rounded: "{rounded.card}"
    width: "11.55rem"
  unit-card-focused:
    backgroundColor: "{colors.focused-surface}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.card}"
    width: "23.85rem"
  ready-status:
    backgroundColor: "{colors.ready-field}"
    textColor: "{colors.ready-mint}"
    typography: "{typography.label}"
    rounded: "0.55rem"
    padding: "0.42rem 0.6rem"
---

# Design System: UniMind

## Overview

**Creative North Star: "The Study Shelf"**

UniMind is a dense but calm academic workspace. Deep matte fields and restrained subject plates let students scan authorized curriculum units as a set of ordered shelves, while off-white type and thin cool-blue separators maintain serious, work-focused clarity. The system is expressive through precise focus behavior, not decoration.

The signature transition turns one shelf item into a trustworthy study doorway: the focused unit expands in place, reveals its identity and state in the active language, and keeps neighboring choices visible. The visual language explicitly rejects the generic LMS dashboard, hospital-software sterility, and chatbot-first shells, while avoiding entertainment browsing cues.

**Key Characteristics:**

- Dark matte surfaces with low elevation and one cobalt interaction voice.
- Compact, locale-switchable hierarchy built for scanning in English or Arabic, including mixed-direction technical content.
- Horizontal academic rails whose focused item expands without hiding catalog context.
- State communicated through text, icons, shape, and contrast rather than color alone.
- Restrained, synthetic subject imagery with replaceable provenance-tracked assets.

## Colors

The palette layers cool night neutrals, paper-like text, focused cobalt, and a dedicated mint readiness signal.

### Primary

- **Cobalt Action:** The scarce high-contrast interaction color for the primary workspace boundary, active focus outlines, and current-location emphasis.
- **Cobalt Focus:** A slightly deeper companion for focused borders and scrollbar affordances.

### Secondary

- **Ready Mint:** Reserved for explicit ready and progress state signals.
- **Ready Field:** The quiet dark field behind positive state copy and icons.

### Neutral

- **Night Canvas / Deep Night:** The main workspace and its deeper navigation or image wells.
- **Shelf / Raised / Focused / Active Surfaces:** A cool tonal ladder that separates cards, utilities, focused units, and current navigation without glossy effects.
- **Paper White / Secondary Ink / Muted Ink:** The three-step text hierarchy for primary content, supporting copy, and metadata.
- **Cool Separator:** The thin structural line used between persistent regions and inside expanded units.
- **On Action:** Pure white reserved for readable content on filled cobalt controls.

**The One Cobalt Voice Rule.** Cobalt identifies focus, current location, and the primary action; do not scatter it as decoration.

**The State Is Redundant Rule.** Readiness and unavailability always pair color with explicit text plus an icon or other non-color cue.

## Typography

**Display Font:** Manrope (with Noto Sans Arabic and sans-serif fallbacks)

**Body Font:** Manrope (with Noto Sans Arabic and sans-serif fallbacks)

**Arabic Font:** Noto Sans Arabic (with sans-serif fallback)

**Character:** A tight workhorse sans hierarchy keeps dense catalog information legible and contemporary. Arabic is a first-class parallel voice, not a decorative translation, and uses its dedicated font without forcing Latin technical terms into Arabic shaping.

### Hierarchy

- **Display:** Bold and tightly tracked for the active-language page heading; fluid sizing keeps it decisive without consuming the shelf viewport.
- **Headline:** Compact shelf headings with a slightly tightened rhythm.
- **Title:** Firm unit names and focused-card identity; use the observed intermediate weight only where the loaded family supports it.
- **Body:** The default reading voice for explanatory and utility copy.
- **Label:** Dense action, status, count, and boundary copy; keep sentence case rather than turning metadata into decorative uppercase.
- **Arabic Title / Body:** Use the dedicated Arabic roles whenever Arabic is active, preserving their observed looser line height.

**The Active Language Rule.** Render one selected interface language at a time. Every visible interface label, state, and description follows the active locale; only the language switch shows both language choices. Keep explicit language and direction boundaries around technical mixed-direction content.

## Layout

The desktop shell uses a fixed product-navigation rail beside a fluid content region. Within content, a bounded search field shares the utility bar with language and identity controls; the heading then leads into multiple horizontal curriculum rails. Default unit tiles are compact, while one focused tile expands to roughly twice a neighbor's width and remains part of the same rail.

Spacing follows the documented quarter-rem progression, with the three-quarter-rem and one-rem steps doing most component work. At the compact desktop breakpoint (68rem), the navigation and content inset tighten. Below the mobile breakpoint (47.99rem), product navigation becomes a fixed bottom strip, identity utilities recede, shelf cards use viewport-relative widths, and rails preserve adjacent context through overflow, snapping, and safe inline padding. The page must not gain horizontal overflow.

RTL uses the same layout through logical properties. The active locale sets the page language and direction, while technical or medical terms use bidi isolation rather than a forked RTL component tree. Touch layouts keep the focused action tall and place it across the detail grid. Mobile product-navigation items occupy equal columns with their icon and label centered inside each tab.

**The Shelf Context Rule.** Expansion happens inside the rail: keep neighboring curriculum choices visible instead of opening an entertainment-style overlay.

## Elevation & Depth

The system is flat at rest. Depth comes primarily from the surface tonal ladder, thin cool separators, and the cobalt focused outline. Only the expanded focused unit receives a restrained structural shadow; navigation, inputs, and default cards remain matte.

### Shadow Vocabulary

- **Focused Lift** (`0 1rem 2rem rgba(0, 0, 0, 0.22)`): Used only beneath the expanded focused unit to distinguish its temporary working layer.

**The Matte-At-Rest Rule.** Default surfaces do not float; reserve the single structural shadow for the focused shelf item.

## Shapes

Cards and controls use gently curved small-to-medium corners, with the card radius slightly larger than the control radius. Pills are limited to compact binary controls, progress tracks, and narrow accent markers. Thin borders and clipped image wells preserve the strict tile geometry; avoid oversized soft containers.

**The Strict Tile Rule.** Keep shelf items visually rectangular and aligned even when focused; expansion changes width and information density, not the underlying form language.

## Components

### Buttons

- **Shape:** Compact curved controls; the workspace action uses the smaller action corner and a tall mobile target.
- **Primary:** Cobalt fill with pure-white active-language copy. It belongs inside the focused unit and remains truthfully disabled until its destination exists.
- **Hover / Focus:** Global focus is a bright three-pixel cobalt outline with matching offset. Avoid motion on disabled actions.
- **Locale:** A quiet pill group with a transparent option at rest and an active-surface fill for the pressed option.

### Chips

- **Style:** Ready state uses a compact mint-on-deep-green badge with an icon and localized text.
- **State:** Unavailable content uses a lock, explicit generic wording, and reduced prominence; color never carries the state alone.

### Cards / Containers

- **Corner Style:** Gently curved cards use the shared card radius and clip their image wells.
- **Background:** Default cards use the shelf surface; the selected card moves to the focused surface.
- **Shadow Strategy:** Flat by default, with Focused Lift only on the expanded item.
- **Border:** Default borders disappear into the surface; focused cards receive a cobalt border and inset outline.
- **Internal Padding:** Compact title regions use the three-quarter-rem scale, while expanded detail regions use the one-rem scale.

### Inputs / Fields

- **Style:** Search uses a raised matte surface, a thin cool border, and a two-column logical layout that reserves a dedicated cell for the leading icon so localized placeholder text cannot overlap it.
- **Focus:** The border becomes transparent so the global cobalt focus outline is the only strong ring.
- **Placeholder:** Supporting text stays visibly lighter than muted metadata on the deep input field.

### Navigation

Desktop navigation is a quiet fixed rail on the deepest field. The current location receives an active-surface fill, a cobalt logical-start marker, and brighter blue copy; unavailable destinations remain visibly disabled. On mobile, the same semantic navigation becomes a fixed bottom strip with six equal-width, centered tabs and an upper current marker.

### Focused Unit

The focused unit is the signature component. It expands in place, pairs a restrained synthetic subject plate with active-language identity, then exposes readiness, source count, scope, honest destination state, and description. Pointer and keyboard activation share the same selected state; hover may gently scale only the image, never reveal essential information.

Subject images are replaceable, synthetic, and provenance-tracked. Icons remain simple local line SVGs. Neither may imply actual curriculum availability or evidence.

Motion is limited to the unit-width transition and the small image hover scale, both using the same 360ms emphasized easing. Under reduced-motion preference, both transitions are removed and mobile focus scrolling becomes immediate.

## Do's and Don'ts

### Do:

- **Do** keep application surfaces in Operate mode: scanability, state clarity, and familiar controls outrank expression.
- **Do** keep multiple curriculum rails and adjacent units visible at representative desktop widths.
- **Do** render only the active locale, preserve semantic language and direction attributes, and keep logical CSS properties, keyboard focus, touch targets, and reduced-motion behavior.
- **Do** use synthetic, provenance-tracked, replaceable subject imagery as restrained academic context.
- **Do** state availability, readiness, and pending destinations truthfully with text plus a non-color cue.

### Don't:

- **Don't** turn the shelf into a generic LMS dashboard, hospital-software interface, or chatbot-first shell.
- **Don't** imitate streaming entertainment with posters, autoplay, hover-only disclosure, or cinematic overlays.
- **Don't** add gamification, glassmorphism, neon glow, excessive animation, remote runtime assets, or invented claims.
- **Don't** treat medical imagery as proof of approved sources, real curriculum, or availability.
- **Don't** create separate LTR and RTL visual systems or allow mixed-direction labels to merge without isolation.
