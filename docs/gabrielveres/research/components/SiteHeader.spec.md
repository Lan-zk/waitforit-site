# SiteHeader Specification

## Overview

- **Target file:** `src/components/SiteHeader.tsx`
- **Screenshot:** `research/design-references/original-desktop-1440.png`
- **Interaction model:** hover-driven navigation + time-driven clock

## DOM Structure

- `<header>`
  - `.desktop-header`
    - left group: starburst link + Work/About/Blog pill links
    - centered uppercase wordmark
    - right group: Contact pill + time/globe capsule
  - `.mobile-header`
    - local-time label
    - circular starburst mark

## Computed Styles

### Header

- position: `fixed`
- top: `36px`
- left/right: `0`
- z-index: `2000`
- pointer events: wrapper none; interactive children auto

### Container

- display: `flex`
- align-items: `center`
- justify-content: `space-between`
- width: `100%`
- padding: `0 54.4901px` at 1440px
- gap: `5.27324px`

### Starburst

- outer size: `31.625px × 32.5px`
- background: `rgba(255,255,255,.1)`
- border-radius: `50%`
- icon: `18.45px × 18.45px`
- opacity: `0.7`

### Navigation pills

- font-size: `14.062px`
- line-height: `15.4682px`
- background: `rgba(255,255,255,.1)`
- border-radius: `87.8873px`
- padding: `9.22817px 15.8197px 8.78873px`
- transition: color/background `350ms cubic-bezier(.4,0,.2,1)`

### Wordmark

- font-size: `19.3352px`
- line-height: `19.3352px`
- text-transform: uppercase
- horizontal center: exact viewport midpoint

## States & Behaviors

### Pill hover

- Before: white text on `rgba(255,255,255,.1)`.
- After: black text on `#ddfa42`.
- Label copy slides vertically while the second copy replaces it.
- Transition: `350ms cubic-bezier(.4,0,.2,1)`.

### Clock

- Trigger: one-minute interval.
- Content: local time formatted `HH:MM AM/PM`.

## Assets

- Starburst: inline `BrandMark`.
- Globe: inline CSS/SVG icon.

## Text Content

- Work
- About
- Blog
- GABRIEL VERES
- Contact

## Responsive Behavior

- Desktop (`>=768px`): full header.
- Tablet (`768px`): retain desktop header and allow intentional clipping.
- Mobile (`<768px`): hide nav/wordmark/contact; show time left and starburst near
  62.5% of viewport width.
