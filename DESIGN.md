---
name: Wait For It
description: A restrained after-hours editorial gallery for personal publishing.
colors:
  primary: '#ddfa42'
  neutral-bg: '#000'
  neutral-ink: '#fff'
  neutral-body: 'rgb(255 255 255 / 88%)'
  neutral-muted: 'rgb(255 255 255 / 64%)'
  glass: 'rgb(255 255 255 / 10%)'
  glass-strong: 'rgb(255 255 255 / 14%)'
  divider: 'rgb(255 255 255 / 22%)'
  code-surface: '#101010'
  code-ink: '#f4ffbc'
typography:
  display:
    fontFamily: '"FK Display", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: 'clamp(42px, 8vw, 112px)'
    fontWeight: 400
    lineHeight: 0.94
  title:
    fontFamily: '"FK Display", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: 'clamp(26px, 3.5vw, 48px)'
    fontWeight: 400
    lineHeight: 1
  body:
    fontFamily: '"Mabry", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: 'clamp(16px, 1.15vw, 19px)'
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: '"FK Display", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: '14.062px'
    fontWeight: 400
    lineHeight: 1.1
  metadata:
    fontFamily: '"Mabry", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: '13px'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '0.06em'
  code:
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
    fontSize: '0.88em'
    fontWeight: 400
    lineHeight: 1.75
rounded:
  link: '2px'
  focus: '3px'
  compact: '4px'
  media: '12px'
  pill: '999px'
  circle: '50%'
components:
  home-mark:
    backgroundColor: '{colors.glass}'
    textColor: '{colors.neutral-ink}'
    rounded: '{rounded.circle}'
    width: '31.625px'
    height: '32.5px'
  nav-pill:
    backgroundColor: '{colors.glass}'
    textColor: '{colors.neutral-ink}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '9.22817px 15.8197px 8.78873px'
  nav-pill-hover:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.neutral-bg}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '9.22817px 15.8197px 8.78873px'
  language-capsule:
    backgroundColor: '{colors.glass}'
    textColor: '{colors.neutral-muted}'
    rounded: '{rounded.pill}'
    height: '32.5px'
    padding: '0 10px'
  back-pill:
    backgroundColor: '{colors.glass}'
    textColor: '{colors.neutral-ink}'
    rounded: '{rounded.pill}'
    padding: '8px 14px'
    height: '32px'
  publishing-row:
    textColor: '{colors.neutral-ink}'
    typography: '{typography.body}'
    padding: 'clamp(22px, 3.2vw, 38px) 0'
  publishing-row-hover:
    textColor: '{colors.primary}'
    typography: '{typography.body}'
    padding: 'clamp(22px, 3.2vw, 38px) 12px'
  article-link:
    textColor: '{colors.primary}'
    rounded: '{rounded.link}'
    padding: '0'
  code-block:
    backgroundColor: '{colors.code-surface}'
    textColor: '{colors.neutral-ink}'
    typography: '{typography.code}'
    rounded: '{rounded.media}'
    padding: 'clamp(16px, 3vw, 28px)'
  article-quote:
    textColor: '{colors.neutral-muted}'
    typography: '{typography.body}'
    padding: '0.2em 0 0.2em 1.15em'
  chapter-link:
    textColor: '{colors.neutral-ink}'
    rounded: '{rounded.compact}'
    padding: '12px'
---

# Design System: Wait For It

## Overview

**Creative North Star: "The After-Hours Editorial Gallery"**

The system combines the immersion of a black-box exhibition with the discipline
of an editorial desk. A press-black frame and cold-white typography stay quiet
enough for WebGL imagery and long-form writing to lead. Proofing chartreuse
enters like an editor's mark: rare, precise, and tied to action or annotation.

Surfaces are flat and calm. Depth comes from spatial composition, tonal
transparency, fine dividers, gradient veils, and the WebGL scene rather than
decorative shadow. The interface is restrained, immersive, cool, and editorial;
static controls recede, while hover and focus make intent unambiguous.

**Key Characteristics:**

- A press-black stage with cold-white type.
- One proofing-chartreuse signal for links, focus, hover, and annotation.
- FK Display frames the experience; Mabry carries sustained reading.
- Flat translucent capsules and hairline dividers replace conventional panels.
- Fixed spatial chrome surrounds a deliberately scrollable publishing surface.

## Colors

The palette is intentionally narrow: black establishes the gallery, white
carries hierarchy, and one chartreuse accent behaves like a proofreader's mark.

### Primary

- **Proofing Chartreuse:** Use for interactive links, focus rings, selected or
  hovered compact controls, blockquote rules, selection, and code accents. It is
  a signal, not a surface palette.

### Neutral

- **Press Black:** The universal page and WebGL-stage background.
- **Cold White:** Primary headings, labels, navigation, and high-priority text.
- **Reading White:** Long-form body copy with slightly reduced glare.
- **Muted Editorial White:** Descriptions and supporting information.
- **Night Glass:** Translucent navigation capsules and compact overlays that
  preserve the black field behind them.
- **Hairline White:** Dividers, code borders, and quiet structural boundaries.
- **Code Black:** The only recurring lifted tonal surface, reserved for
  preformatted code.
- **Code Chartreuse:** A pale chartreuse used only for inline-code legibility.

### Named Rules

**The Proofreader's Mark Rule.** Chartreuse marks interaction or editorial
emphasis; it never becomes a large decorative page field.

**The Black Stage Rule.** New public surfaces begin from the press-black stage;
lighter tonal surfaces must be local, functional, and subordinate.

## Typography

**Display Font:** FK Display with Simplified Chinese system sans-serif fallbacks
**Body Font:** Mabry with Simplified Chinese system sans-serif fallbacks
**Code Font:** SFMono-Regular with common system monospace fallbacks

**Character:** The pairing separates framing from reading. FK Display is
geometric and exhibition-like; Mabry is quieter, more conventional, and
comfortable across paragraphs, summaries, metadata, and bilingual copy.

### Hierarchy

- **Display:** Large page titles and editorial section openings. Use the
  normative `display` role and keep the weight regular.
- **Headline:** Article headings use FK Display, regular weight, tight leading,
  and fluid steps from compact subheads to large section headings.
- **Title:** Publishing-list titles and previous/next chapter titles use the
  normative `title` role.
- **Body:** Reading copy uses the normative `body` role; supporting summaries
  use the same family with tighter leading and a maximum line length near 60
  characters.
- **Label:** Navigation capsules, the wordmark, and compact controls use FK
  Display at restrained sizes.
- **Metadata:** Indexes, dates, and directional labels use Mabry, uppercase
  treatment where appropriate, and deliberate tracking.
- **Code:** Inline and block code use the normative `code` role.

### Named Rules

**The Two-Face Type Rule.** FK Display frames and navigates; Mabry explains and
sustains reading. Do not swap their jobs without a clear content reason.

**The Regular-Weight Rule.** Scale, spacing, opacity, and family establish
hierarchy before bold weight; weight 500 is reserved for limited emphasis such
as table headers.

## Layout

The homepage is a fixed, full-viewport stage. WebGL occupies the complete
background while the header and footer remain pinned above it. Desktop chrome
uses proportional side insets (`3.784vw`, clamped in the header), a centered
wordmark, compact left and right control groups, a header offset of `36px`, and a
footer offset of `44px`.

Content pages remain full-screen but create their own vertical scrolling surface.
They use fluid page padding (`clamp(88px, 10vw, 144px)` above and
`clamp(24px, 6vw, 96px)` inline), a `1040px` content ceiling, titles capped near
`18ch`, descriptions near `60ch`, and generous section separation. The result is
editorial rather than dashboard-dense.

Publishing indexes are ruled lists, not card grids. On desktop, each row divides
into index, content, metadata, and arrow columns; at `767px` and below the
metadata column disappears and the remaining columns compress. Main desktop
chrome also yields to a sparse mobile header at that breakpoint. Chapter
navigation stacks at `600px`. The Three.js scene uses its matching `768px`
runtime threshold and must retain that contract.

### Named Rules

**The Fixed Stage Rule.** Site chrome and the WebGL world stay spatially fixed;
reading surfaces provide the scroll.

**The Ruled List Rule.** Repeated publishing content uses hairline-separated
rows with generous vertical rhythm, never a generic grid of raised cards.

## Elevation & Depth

The system is flat by default and uses no box-shadow or text-shadow vocabulary.
Depth is conveyed by WebGL perspective, image scale and z-position, translucent
night-glass controls, top and bottom gradient veils, tonal code surfaces,
hairline borders, and an isolated `8px` backdrop blur on the cursor-following
project label.

### Named Rules

**The Flat-by-Default Rule.** Do not add shadows to imply hierarchy; use spatial
placement, tonal contrast, transparency, or a divider first.

**The Local Blur Rule.** Blur belongs only to small overlays that must remain
legible over moving imagery, not to broad page panels.

## Shapes

The form language separates controls from content. Navigation, language
selection, back controls, and the cursor label are full capsules; the home mark
is circular. Reading links and directional containers use small, nearly square
corners. Code blocks and media receive the only visibly rounded content edges.
Structural page regions remain square and unboxed.

### Named Rules

**The Rounded Controls, Square Content Rule.** Capsules indicate compact
interaction; editorial content does not sit inside rounded cards.

## Components

The component philosophy is: **static when restrained, explicit when
interactive**.

### Home Mark

- **Shape:** A compact circular night-glass control containing the radial
  Wait For It mark.
- **State:** Hover and keyboard focus switch to proofing chartreuse with black
  ink while the mark rotates `45deg`.
- **Responsive:** Desktop uses the compact control; mobile expands it to a
  `54px` circle with a larger mark.

### Navigation Pills

- **Shape:** Fully rounded capsules using the normative `nav-pill` tokens.
- **State:** Hover and focus invert to chartreuse and black. Labels slide
  vertically over `350ms`, preserving the same wording rather than introducing
  new copy.
- **Motion:** Color, background, label, and mark transitions collapse to
  effectively instant behavior when reduced motion is requested.

### Language Switcher

- **Shape:** A single translucent capsule containing two text buttons separated
  by a slash.
- **State:** Inactive text is muted; hover, focus, and the selected language
  become cold white. Keyboard focus receives a compact chartreuse outline.

### Back Pill

- **Shape:** A short text capsule fixed above content pages.
- **State:** It shares the chartreuse-and-black hover and focus inversion used
  by navigation.

### Publishing Row

- **Structure:** A hairline-separated grid containing a zero-padded index,
  title and optional summary, date metadata, and a directional arrow.
- **State:** Hover adds a small inline inset and turns the active row
  chartreuse; focus uses an offset chartreuse outline.
- **Responsive:** Date metadata disappears on small screens while the index,
  content, and arrow remain.

### Article Content

- **Links:** Chartreuse, underlined, and visibly outlined on keyboard focus;
  hover returns to cold white.
- **Blockquotes:** Flat, muted text with a chartreuse inline rule.
- **Code:** Inline code uses a faint glass fill and hairline border; blocks use
  the Code Black surface, a `12px` radius, and horizontal overflow.
- **Media:** Images remain naturally sized within the text column and use fluid
  corner rounding without shadow.

### Chapter Navigation

- **Structure:** Two equal ruled columns with previous and next labels; the next
  column aligns to the reading end.
- **State:** A subtle glass fill and chartreuse text appear on hover or focus.
- **Responsive:** The columns stack and both align to the reading start below
  `600px`.

### WebGL Project Label

- **Shape:** A cursor-following night-glass capsule with a fine border.
- **Depth:** It is the sole blurred overlay and remains visually subordinate to
  the artwork.
- **State:** Opacity appears quickly; mobile omits the label.

## Do's and Don'ts

### Do:

- **Do** keep public surfaces grounded in Press Black and Cold White.
- **Do** reserve Proofing Chartreuse for interaction, focus, and editorial
  annotation.
- **Do** use FK Display for framing and Mabry for sustained reading.
- **Do** create hierarchy with scale, spacing, opacity, dividers, and spatial
  composition before adding containers.
- **Do** make keyboard focus at least as explicit as hover.
- **Do** preserve the `767px` CSS and `768px` WebGL responsive contract.
- **Do** honor reduced-motion behavior whenever interaction is animated.

### Don't:

- **Don't** make the site resemble a SaaS dashboard.
- **Don't** introduce bright playful palettes or many competing card colors.
- **Don't** wrap editorial lists or reading content in generic raised cards.
- **Don't** add decorative shadows, broad frosted-glass panels, or ambient glow.
- **Don't** use chartreuse as a large background except on compact active
  controls.
- **Don't** replace the fixed WebGL stage with conventional dashboard or content
  grid composition.
