# Minor Arcana Asset Audit

**Date:** 2026-06-15

## Outcome

- Kept the original 17 high-quality minor arcana assets in the formal runtime directory: `app/public/cards/`
- Isolated the 39 low-quality generated assets into: `app/public/cards_quarantine/generated-low-quality/`
- Repointed the 39 affected entries in `app/src/data/tarotCards.ts` to the neutral placeholder: `/assets/card-back.jpg`

## Original 17 Minor Arcana Assets

These remain in `app/public/cards/` and are treated as the visual quality baseline:

- `wands-1.png`
- `wands-2.png`
- `wands-3.png`
- `wands-4.png`
- `wands-5.png`
- `wands-6.png`
- `wands-7.png`
- `wands-8.png`
- `wands-9.png`
- `wands-10.png`
- `wands-page.png`
- `wands-knight.png`
- `wands-queen.png`
- `wands-king.png`
- `cups-2.png`
- `swords-3.png`
- `pentacles-1.png`

## Isolated 39 Generated Assets

These were removed from `app/public/cards/` and moved into `app/public/cards_quarantine/generated-low-quality/`:

- `cups-1.png`
- `cups-3.png`
- `cups-4.png`
- `cups-5.png`
- `cups-6.png`
- `cups-7.png`
- `cups-8.png`
- `cups-9.png`
- `cups-10.png`
- `cups-page.png`
- `cups-knight.png`
- `cups-queen.png`
- `cups-king.png`
- `swords-1.png`
- `swords-2.png`
- `swords-4.png`
- `swords-5.png`
- `swords-6.png`
- `swords-7.png`
- `swords-8.png`
- `swords-9.png`
- `swords-10.png`
- `swords-page.png`
- `swords-knight.png`
- `swords-queen.png`
- `swords-king.png`
- `pentacles-2.png`
- `pentacles-3.png`
- `pentacles-4.png`
- `pentacles-5.png`
- `pentacles-6.png`
- `pentacles-7.png`
- `pentacles-8.png`
- `pentacles-9.png`
- `pentacles-10.png`
- `pentacles-page.png`
- `pentacles-knight.png`
- `pentacles-queen.png`
- `pentacles-king.png`

## Current Runtime Behavior

- Original 17 minor arcana cards still render with their original asset files.
- The 39 isolated entries now render the neutral card back instead of low-quality generated art.
- Major arcana assets were not changed.

## Next High-Quality Rebuild Scope

The next proper rebuild should target exactly these 39 missing final assets:

- Cups: `1, 3-10, page, knight, queen, king`
- Swords: `1, 2, 4-10, page, knight, queen, king`
- Pentacles: `2-10, page, knight, queen, king`

## Recommended Rebuild Standard

- Use the original 17 minor arcana as the only style baseline.
- Do not accept script-generated geometric overlays as final art.
- Rebuild the 39 missing assets one batch per suit, with visual review before copying into `app/public/cards/`.
