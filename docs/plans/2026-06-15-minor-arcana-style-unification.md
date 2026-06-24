# Minor Arcana Style Unification Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the 39 replacement minor arcana cards around the original 17-card style and apply a shared finishing pass so the full 56-card minor arcana deck feels visually unified.

**Architecture:** Use a local Python/Pillow asset pipeline. The generator should copy the original minor arcana assets, regenerate the 39 replacements by compositing over original suit exemplars, then run one finishing pass across all 56 minor arcana images before writing them into `app/public/cards/`.

**Tech Stack:** Python, Pillow, existing local PNG assets, TypeScript data references

---

### Task 1: Save The Agreed Design

**Files:**
- Create: `docs/plans/2026-06-15-minor-arcana-style-unification-design.md`
- Create: `docs/plans/2026-06-15-minor-arcana-style-unification.md`

**Step 1: Write the validated design summary**

- Capture the agreed target style, scope, non-goals, and acceptance criteria.

**Step 2: Save the implementation plan**

- Record the exact files, generation flow, and verification approach.

**Step 3: Verify the docs exist**

Run: `Get-ChildItem docs\plans`
Expected: both 2026-06-15 plan documents are present.

### Task 2: Rework The Minor Arcana Generator

**Files:**
- Modify: `scripts/generate_minor_arcana_cards.py`

**Step 1: Replace the abstract overlay-heavy approach**

- Make the generator use the original suit anchor cards as visual bases.

**Step 2: Add a shared finishing pass**

- Normalize contrast, gold tone, vignette, and edge darkness for all 56 minor arcana outputs.

**Step 3: Preserve filenames and suit-specific composition rules**

- Keep `wands-*`, `cups-*`, `swords-*`, `pentacles-*` output names stable.

**Step 4: Run the generator**

Run: `python scripts/generate_minor_arcana_cards.py`
Expected: 39 missing cards regenerated and all 56 minor arcana written into `app/public/cards`.

### Task 3: Verify Asset Coverage And References

**Files:**
- Verify: `app/public/cards/*.png`
- Verify: `app/src/data/tarotCards.ts`

**Step 1: Confirm minor arcana file coverage**

Run: count files and confirm 56 minor arcana outputs exist.

**Step 2: Confirm app references still resolve**

Run: parse `app/src/data/tarotCards.ts` and ensure every minor `/cards/*.png` reference exists on disk.

**Step 3: Spot-check representative images**

- Review at least one regenerated cup, sword, and pentacle card beside original reference assets.

### Task 4: Report Remaining Risks

**Files:**
- None

**Step 1: Call out what was verified**

- Asset count
- Reference resolution
- Representative visual spot checks

**Step 2: Call out what could not be verified**

- App build/runtime if local Node dependencies are unavailable
- Subjective artistic preference beyond current pass
