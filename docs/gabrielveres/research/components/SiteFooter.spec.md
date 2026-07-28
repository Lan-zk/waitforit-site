# SiteFooter Specification

## Overview

- **Target file:** `src/components/SiteFooter.tsx`
- **Screenshot:** `research/design-references/original-desktop-1440.png`
- **Interaction model:** link hover

## DOM Structure

- `<footer>`
  - email anchor
- scene labels/controls
  - Overview
  - Index link

## Computed Styles

### Footer

- position: `fixed`
- bottom: `44px` desktop
- z-index: `1991`
- width: `100%`
- padding-inline: `54.4901px` at 1440px

### Email

- font-size: `15.8197px`
- line-height: `17.4017px`
- color: white

## States & Behaviors

### Email hover

- Underline grows from scale-x `0` to `1`.
- Transform origin: bottom left.
- Duration: `250ms`.

### Index hover

- Same vertical label-swap behavior as navigation.

## Text Content

- office@humanist.ro
- Overview
- Index

## Responsive Behavior

- Desktop/tablet (`>=768px`): footer and controls visible.
- Mobile (`<768px`): hidden.
