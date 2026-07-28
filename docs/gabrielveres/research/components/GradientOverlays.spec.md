# GradientOverlays Specification

## Overview

- **Target file:** `src/components/GradientOverlays.tsx`
- **Screenshot:** `research/design-references/original-desktop-1440.png`
- **Interaction model:** static

## DOM Structure

- top fixed overlay
- bottom fixed overlay

## Computed Styles

### Top

- position: `fixed`
- top: `0`
- width: `100%`
- height: `15%`
- z-index: `1990`
- pointer-events: `none`
- background:
  `linear-gradient(0deg, rgba(1,1,1,0) 15.2%, rgba(1,1,1,.5) 51%, rgba(0,0,0,.85) 84.8%)`

### Bottom

- position: `fixed`
- bottom: `0`
- width: `100%`
- height: `15%`
- z-index: `1990`
- pointer-events: `none`
- background:
  `linear-gradient(0deg, rgba(0,0,0,.85) 9.5%, rgba(1,1,1,.5) 51%, rgba(1,1,1,0) 84.8%)`

## States & Behaviors

N/A — visual-only overlays.

## Assets

N/A.

## Text Content

N/A.

## Responsive Behavior

- Same `15%` viewport-height treatment at all breakpoints.
