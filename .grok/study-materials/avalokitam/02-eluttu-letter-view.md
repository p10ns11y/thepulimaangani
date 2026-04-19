# 02. எழுத்து (Eluttu / Letter) View Page

**Live Equivalent**: View mode "எழுத்து" (icon sort_by_alpha)  
**Components**: LetterDisplay.vue, LetterType.vue, LetterPattern.vue, LetterCount logic from ProsodyParseTree::GetLetterCount()  
**Focus**: Lowest-level analysis — individual letters, matra counting, classification. Foundation for all higher syllable/foot annotations.

## Header
- **Label**: எழுத்து (Letters)
- **Description**: "எழுத்து என்பது யாப்பின் மிகச்சிறிய அலகு. உயிர், மெய், உயிர்மெய், ஆய்தம் என வகைப்படும்."

## Display Layout
- Verse shown with each letter as a separate token/box.
- **Columns or Inline**:
  - Letter (தமிழ்)
  - Type (உயிர் / மெய் / உயிர்மெய் / ஆய்தம்)
  - Matra Value (1 or 2)
  - Position in acai/foot (for cross-reference to higher views)
- **Total**: LetterCount at top (from original GetLetterCount()).

## Special Annotations & Hints
- **ஆய்தம் (ḥ)**: "Usually ignored in matra count for classical scansion — shown with strikethrough or 'non-counting' badge".
- **Long vs Short Vowels**: "ஆ = 2 matras (ner base); அ = 1 matra".
- **Consonant + Vowel (uyirmei)**: Shows decomposition "க + அ = க (uyirmei, 1 matra)".
- **Special Tamil Cases**: "Final 'ம்' or 'ன்' in some positions may be treated as mei-only for counting".
- **Link to Syllable View**: Click any letter → highlights the parent acai/foot and opens the split annotation tooltip from அசை view.

## Educational Content
- Short lesson snippet: "In traditional prosody, the total matras in a line must follow certain patterns for the metre to be valid (e.g., Venpaa has specific matra expectations per line)."

**For New Implementation**:
- Simple grid or flex wrap of letter chips.
- On analysis, WASM returns Letter[] array with type, matra, position.
- Use this as the base layer that higher views (syllable, foot) are built upon — clicking "Drill down to letters" from any view jumps here with the relevant letters highlighted.

*Extracted from component names, PHP GetLetterCount logic, and UI labels.*