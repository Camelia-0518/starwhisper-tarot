# Minor Arcana Style Unification Design

**Date:** 2026-06-15

**Goal:** Keep the original 17 minor arcana cards as the visual anchor, rebuild the 39 replacement cards around that language, and lightly unify the existing 17 so the full 56-card minor arcana deck reads as one set.

## Confirmed Direction

- Preserve the original 17 minor arcana cards as the style reference.
- Rebuild the 39 replacement cards to match the original small-arcana look rather than the major-arcana look.
- Apply light normalization to the original 17 cards instead of redrawing them.
- Do not change major arcana assets, tarot meanings, app layout, or card naming.

## Style Target

The unified deck should follow the visual language already present in the original 17 minor arcana assets:

- Deep midnight-blue base with warm gold linework.
- Dense celestial detail without looking like a flat geometric template.
- Symbol-led composition with a clear central focal point.
- Suit-specific atmosphere:
  - Wands: fire, vertical wand energy, sparks, volcanic or radiant heat.
  - Cups: moonlight, water, reflections, chalices, emotional softness.
  - Swords: sharp diagonals, wind, rupture, cold glow, tension.
  - Pentacles: altar, coin, vines, harvest, grounded abundance.

## Implementation Strategy

### 1. Rebuild The 39 Replacement Cards

- Use the original suit exemplars as source anchors:
  - `minor_arcana_56/cups/cups-2.png`
  - `minor_arcana_56/swords/swords-3.png`
  - `minor_arcana_56/pentacles/pentacles-1.png`
- Generate new cards by compositing around those exemplars instead of drawing abstract shapes from scratch.
- Keep the original borders and atmosphere visible under the new composition so the new cards inherit the same texture and density.

### 2. Lightly Normalize The Existing 17 Cards

- Copy the original 17 cards into `app/public/cards/`.
- Apply the same finishing pass to all 56 minor arcana cards:
  - subtle contrast lift
  - unified warm-gold highlight
  - mild vignette
  - consistent edge darkness and glow balance

### 3. Preserve App Integration

- Keep all filenames in `app/public/cards/` unchanged.
- Keep `app/src/data/tarotCards.ts` pointing at `/cards/<name>.png`.
- Limit code changes to asset-generation support unless a path fix is required.

## Acceptance Criteria

- The 56 minor arcana cards no longer split into visibly different “old” and “new” batches.
- Cups, swords, and pentacles no longer read as simplistic geometric overlays.
- Each suit remains distinct while sharing one overall finish.
- The frontend asset directory contains all 56 minor arcana files under stable names.
- Spot-checking mixed cards from one suit does not reveal obvious style discontinuity.

## Files Expected

- `docs/plans/2026-06-15-minor-arcana-style-unification.md`
- `scripts/generate_minor_arcana_cards.py`
- `app/public/cards/*.png`

## Constraints

- No dependency installation is assumed.
- No network-based image generation is required.
- No git commit is possible here because the project root is not a git repository.
