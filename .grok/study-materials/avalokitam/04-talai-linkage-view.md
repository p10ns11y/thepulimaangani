# 04. தளை (Talai / Linkage) View Page

**Live Equivalent**: "தளை" view (icon: link)  
**Components**: LinkageDisplay.vue, LinkageBond.vue, LinkageBondLine.vue, LinkageLegend.vue, LinkagePattern.vue  
**Focus**: Connections between feet — the "rhythm glue" of Tamil prosody. Visual leader lines are a signature feature.

## Header
- **Label**: தளை (Linkage / Bond)
- **Description**: "அடுத்தடுத்த சீர்களுக்கிடையேயான தொடர்பு. வெண்டளை, ஆசிரியத்தளை போன்ற வகைகள் உண்டு."

## Visual Display
- Feet shown in sequence (from previous view).
- **Leader Lines** (original uses Leader-line.js): Curved or straight lines connecting end of one foot to start of next, labeled with talai type (e.g., "வெண்டளை").
- **Color Coding**: Strong/valid bonds one color, weak or rule-breaking another.
- **Special Annotations**:
  - "This talai satisfies Venpaa last-acai rule because previous foot ends in nA_L and next begins in matching pattern".
  - "Broken talai detected — possible poetic license or error. Click for rule details".
  - "AltScansion changes this talai to Asiriya type — see alt parse".

## Educational Layer
- Legend (LinkageLegend.vue): Explains main talai types with short examples.
- Hover on line → Shows the exact acai pair that forms the bond + phonological reason.
- "Learn more" → Opens the தளை section of Lessons page (08).

**Implementation**:
- Use SVG or canvas for dynamic leader lines (or react-leader-line / custom Framer).
- WASM returns Linkage[] with fromFoot, toFoot, type, isValid, hint.
- Critical for visual fidelity — original's strength is the beautiful, clear talai visualization.

*From component names and original flow (GetWordBond, talai calculation in parse tree).*