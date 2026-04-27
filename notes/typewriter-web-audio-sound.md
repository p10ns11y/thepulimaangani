# Typewriter sound: implementation, legitimacy, and security

This note describes how the prosody editor’s optional typewriter SFX works, why that approach is appropriate for the web platform, and what security and privacy properties it has.

## How it is implemented

### Stack

- **Web Audio API** (`AudioContext`, `OscillatorNode`, `GainNode`) in [`src/hooks/useTypewriterSound.ts`](../src/hooks/useTypewriterSound.ts).
- Sounds are **synthesized in real time** (triangle / square / sine envelopes with short ramps). There are **no audio files**, no decode step, and no asset URLs for SFX.

### Signal path

1. **Physics / editor events** in [`useTypewriterPaperPhysics`](../src/hooks/useTypewriterPaperPhysics.ts) emit abstract cues: `feed`, `tick`, `settle` (see `TypewriterPhysicsCue`).
2. **`PoemEditLiveContextRail`** passes those cues to a callback from the parent.
3. **`ProsodyLab`** owns `useTypewriterSound` and forwards `playCue(cue)` from that callback.
4. Each cue builds a one-shot graph: `oscillator → envelope gain → master gain → context.destination`, starts/stops the oscillator over ~30–100 ms, then the nodes are eligible for GC.

### Master gain

Peak per-cue gains are modest linear amplitudes; a dedicated **`GainNode`** (`MASTER_LINEAR_GAIN`) scales output at the sink because many systems mix Web Audio **quieter** than normal tab media. This is a UX tuning choice, not a security feature.

### Rate limiting

`MIN_GAP_MS` enforces a **minimum time between plays of the same cue type** so rapid parse updates or typing do not create audio spam or excessive CPU from overlapping voices.

### Lifecycle

- **One `AudioContext`** is retained in a ref and reused for all cues.
- On hook unmount, the context is **`close()`d** so the graph does not leak across navigations.
- Playback is **skipped** when `document.hidden` (background tab), aligning with “no surprise audio” when the page is not visible.

## Legitimacy (platform policy, accessibility, consent)

### Opt-in by default (preference)

- The feature is **off by default** in storage: [`readTypewriterSoundEnabled()`](../src/lib/typewriterEditorPreferences.ts) returns `false` when unset.
- Users turn it on with an explicit **“Typewriter sound”** control in the poem editor (`PoemEditDialog`), which persists `thepulimaangani.typewriter.sound` in **`localStorage`** (`'1'` / `'0'`).

This matches common expectations: sound should not play until the user has chosen it.

### Autoplay and user activation

Browsers often start `AudioContext` in **`suspended`** until there is a **user gesture**. The implementation:

- Exposes **`resume()`**, which calls `audioContext.resume()` after the user enables sound (toggle **on** is a click in `ProsodyLab`).
- **`playCue`** also attempts `resume()` if the context is still suspended when a cue fires.

This follows the **legitimate pattern** recommended for Web Audio: tie audio to user interaction and recover from suspended state without assuming autoplay is allowed.

### Reduced motion

In **`ProsodyLab`**, the sound hook is gated with **`usePrefersReducedMotion()`**: when the user prefers reduced motion, **`useTypewriterSound(false, …)`** is used so synthesis does not run for editor cues. That keeps motion and sound policy aligned for users who signal they want less sensory stimulation.

### Scope of playback

Audio only runs when:

- the user has enabled the preference,
- the poem **editor is open**,
- the document is **visible**,

so playback is tied to an active editing session, not arbitrary page state.

### Independence from paper physics

Editor motion (`useTypewriterPaperPhysics` `enabled`) and **cue emission** (`cuesEnabled`, derived from sound on and not reduced-motion) are separate: turning **paper physics off** does not stop **sound cues**; turning **sound off** does not stop paper motion. Settle sounds use the spring when motion is on, and a short debounced settle when sound is on but motion is off.

## Security and privacy

### No network or external media for SFX

- Cues use **only** in-memory oscillators and envelopes. There is **no `fetch` of audio**, no CDN samples, and no third-party player. That **shrinks the attack surface**: no malicious WAV/MP3 parser, no supply-chain audio URL, no mixed-content audio loads.

### No microphone or device access

The implementation does **not** use `getUserMedia`, `MediaRecorder`, or device enumeration. It is **output-only** synthesis.

### Storage

`localStorage` holds **only a boolean preference** for sound (and separately for paper physics). No poem text, tokens, or identifiers are written by these helpers.

### Content Security Policy (CSP)

Procedural Web Audio does **not** require `media-src` or `connect-src` exceptions for sample playback. If the app uses a strict CSP, **sample-based** SFX would often need extra allowances; this approach avoids that class of issue.

### Denial-of-service / resource use

- Each cue is **short** and **rate-limited**.
- The graph is **small** (a few nodes per cue). There is no unbounded queue of buffers or workers.

This does not eliminate all abuse (a compromised script could still call Web Audio APIs), but it avoids **large** asset or decode workloads from this feature.

### What this document does not claim

- **Copyright / “legitimacy” of sound design**: the tones are **original synthetic** shapes, not recordings of a physical typewriter. They are “typewriter-like” in character, not archival samples.
- **Cryptographic or DRM properties**: Web Audio is a normal browser API; this is not a security boundary against a fully compromised renderer.

## Related files

| Area | File |
|------|------|
| Synthesis + playback | [`src/hooks/useTypewriterSound.ts`](../src/hooks/useTypewriterSound.ts) |
| Cue source (motion / parse events) | [`src/hooks/useTypewriterPaperPhysics.ts`](../src/hooks/useTypewriterPaperPhysics.ts) |
| Preference keys | [`src/lib/typewriterEditorPreferences.ts`](../src/lib/typewriterEditorPreferences.ts) |
| Wiring (sound hook, toggle, `resume`) | [`src/components/prosody/ProsodyLab.tsx`](../src/components/prosody/ProsodyLab.tsx) |
| Editor toggles | [`src/components/prosody/PoemEditDialog.tsx`](../src/components/prosody/PoemEditDialog.tsx) |
| Paper preview + cue callback | [`src/components/prosody/PoemEditLiveContextRail.tsx`](../src/components/prosody/PoemEditLiveContextRail.tsx) |

## Summary

The typewriter sound is **procedural Web Audio**, **opt-in**, **user-gesture–friendly**, **reduced-motion aware**, and **non-fetching**, which keeps it aligned with browser autoplay rules, accessibility expectations, and a small security/reliability footprint compared to loading external audio assets.

*Human side of this work: [typewriter-collaboration-appreciation.md](./typewriter-collaboration-appreciation.md).*
