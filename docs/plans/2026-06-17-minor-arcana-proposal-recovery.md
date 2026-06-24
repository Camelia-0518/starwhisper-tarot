# Minor Arcana Proposal Recovery Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Recover the cached minor-arcana proposal images, place them into the proposal directory with stable card filenames, and generate the remaining missing pentacles proposal images without touching the formal production card assets.

**Architecture:** Rebuild the proposal set in `app/public/cards_proposed_template_v1` from the local Codex image cache for the 2026-06-16 session. Then generate only the remaining eight pentacles cards in the same visual language, save them into the proposal directory, and verify that the directory contains the full 39-card proposal batch.

**Tech Stack:** PowerShell file operations, Codex built-in image generation, local workspace asset verification.

---

### Task 1: Recover cached proposal images

**Files:**
- Modify: `app/public/cards_proposed_template_v1/`
- Reference: `docs/minor-arcana-asset-audit-2026-06-15.md`

**Step 1: Create the ordered filename mapping**

Map the recovered 2026-06-16 cached files to:
- `cups-1.png`
- `cups-3.png` through `cups-10.png`
- `cups-page.png`, `cups-knight.png`, `cups-queen.png`, `cups-king.png`
- `swords-1.png`, `swords-2.png`, `swords-4.png` through `swords-king.png`
- `pentacles-2.png` through `pentacles-6.png`

**Step 2: Copy the files into the proposal directory**

Copy each cached file into `app/public/cards_proposed_template_v1` using the stable card filename.

**Step 3: Verify the recovered count**

Confirm the proposal directory contains 31 recovered files after the copy.

### Task 2: Generate the remaining pentacles proposal images

**Files:**
- Modify: `app/public/cards_proposed_template_v1/`

**Step 1: Generate the missing cards**

Generate:
- `pentacles-7.png`
- `pentacles-8.png`
- `pentacles-9.png`
- `pentacles-10.png`
- `pentacles-page.png`
- `pentacles-knight.png`
- `pentacles-queen.png`
- `pentacles-king.png`

**Step 2: Save the generated outputs**

Move or copy the selected generated images from the Codex generated-images cache into `app/public/cards_proposed_template_v1` with those stable filenames.

**Step 3: Keep style invariants**

Use the existing deck language:
- deep midnight-blue background
- ornate gold filigree border
- celestial field and radial star geometry
- painterly fantasy rendering
- no text, no letters, no numbers

### Task 3: Final verification

**Files:**
- Verify: `app/public/cards_proposed_template_v1/`

**Step 1: Count the final directory**

Confirm the proposal directory contains exactly 39 files.

**Step 2: Check missing filenames**

Verify the full expected set is present for cups, swords, and pentacles proposal cards.

**Step 3: Report the result**

Summarize which images were recovered from cache and which eight were newly generated.
