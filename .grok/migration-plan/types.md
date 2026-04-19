# Avalokitam - Types Page (வெண்பா வகைகள்)
**URL:** https://www.avalokitam.com/types

## Exact Verbatim Content (Full Extraction – Partial due to length, key sections captured)

**Header**
*menu*
அ
அவலோகிதம்
யாப்பு மென்பொருள்

**Page Title / Intro**
வெண்பா
வெண்பாவினம்
ஆசிரியப்பா
ஆசிரியப்பாவினம்
கலிப்பா
கலிப்பாவினம்
வஞ்சிப்பா
வஞ்சிப்பாவினம்

**Interactive Instructions (verbatim)**
கீழே உள்ள பாக்களை தாங்கள் தாராளமாக மாற்றலாம். நீங்கள் மாற்ற மாற்ற, உங்கள் மாற்றம் பா விதிகளுக்கு உட்பட்டுள்ளதா என்று உடனடியாக காட்டுவிடும். மூல உதாரணத்தை திரும்பப்பெற ‘மீளமை’ என்பதை கிளிக் செய்யவும். பாவினை விலாவரியாக அவலோகிதம் கொண்டு ஆராய, ‘ஆராய்க’ என்பதை கிளிக் செய்யவும்.

**Examples (verbatim – multiple interactive cards)**

**ஒரு விகற்ப குறள் வெண்பா**
ஆராய்க | மீளமை

Rules with status:
- ஈற்றடியின் ஈற்றுச்சீரைத் தவிர்த்து ஈரசைச்சீர்களும் காய்ச்சீர்களும் மட்டுமே பயின்று வருதல் வேண்டும் *done*
- வெண்டளைகள் மட்டுமே பயின்று வருதல் வேண்டும் *done*
- ஈற்றடி மூன்று சீர்களும் ஏனைய அடிகள் நான்கு சீர்களும் கொண்டிருத்தல் வேண்டும் *done*
- ஈற்றடியின் ஈற்றுச்சீர் நாள், மலர், காசு, பிறப்பு ஆகியவற்றுள் இருத்தல் வேண்டும் *done*
- நேரிசையாகின் ஒருவிகற்பமோ அல்லது இருவிகற்பமோ கொண்டு எதுகை அமைந்த தனிச்சொல் பெற்று வருதல் வேண்டும். நேரிசை விதிகள் பொருந்தாத அனைத்தும் இன்னிசை ஆகும். *info*

Result: 2 அடிகளுடன் 1 விகற்பம் கொண்டு வந்ததால் ஒரு விகற்பக் குறள் வெண்பா ஆயிற்று

(Repeated similar interactive blocks for:)
- இரு விகற்ப குறள் வெண்பா
- நேரிசை சிந்தியல் வெண்பா
- இன்னிசை சிந்தியல் வெண்பா
- ஒரு விகற்ப நேரிசை வெண்பா
(and more variants)

## Analyzed Details
- **Purpose:** Educational + interactive explorer for different வெண்பா subtypes (குறள், சிந்தியல், நேரிசை, இன்னிசை, etc.).
- **Design:** Card-based layout with editable example poems. Live validation (green *done* / blue *info* badges).
- **Interactive:** "ஆராய்க" runs full analyzer on the example. "மீளமை" resets to original. Users can edit text and see instant rule compliance feedback.
- **Value:** Best teaching tool in the original site.

## Adaptation Plan for thepulimaangani

**Must Implement:**
- Exact page title and intro text.
- Multiple editable example cards with "ஆராய்க" (Analyze) and "மீளமை" (Reset) buttons.
- Live rule validation badges (*done* / *info*) – map to your existing metre rules engine.
- Allow free editing of example text with real-time feedback (leverage your real-time WASM parser).

**What is NOT necessary:**
- Old PHP validation logic → use your Rust parser + rule engine.
- Exact card styling → modern Tailwind cards with green/blue badges.

**Recommended Components:**
- `VenpaaTypesExplorer.tsx` (grid of cards)
- Reusable `ExamplePoemCard.tsx` with editable textarea + live validation

**Priority:** High – excellent for learning section.