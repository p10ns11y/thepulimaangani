# Classical decision tree

First match wins. The ML verdict stays the primary metre. `classical_tree` sits beside it and records each check: rule id, pass or fail, Tamil sentence.

```mermaid
flowchart TD
  poem["அடி · சீர் · தளை · எதுகை · தனிச்சொல்"] --> venpaa["வெண்பா<br/>குறள் 1/2 விகற்பம் · நேரிசை/இன்னிசை சிந்தியல் · நேரிசை/இன்னிசை · பஃறொடை · கலிவெண்பா"]
  venpaa -->|இல்லை| aciriya["ஆசிரியப்பா<br/>நிலைமண்டில · நேரிசை · இணைக்குறள்"]
  aciriya -->|இல்லை| tharavu["தரவுகொச்சகக் கலிப்பா"]
  tharavu -->|இல்லை| venkali["வெண்கலிப்பா"]
  venkali -->|இல்லை| vanji["வஞ்சிப்பா<br/>குறளடி · சிந்தடி"]
  vanji -->|இல்லை| venvinam["வெண்பாவினம்<br/>தாழிசை · துறை · விருத்தம்"]
  venvinam -->|இல்லை| acivinam["ஆசிரியப்பாவினம்<br/>தாழிசை · துறை · விருத்தம்"]
  acivinam -->|இல்லை| kalivinam["கலிப்பாவினம்<br/>தாழிசை · துறை · விருத்தம் · கட்டளை"]
  kalivinam -->|இல்லை| vanjivinam["வஞ்சிப்பாவினம்<br/>தாழிசை · துறை · விருத்தம்"]
  vanjivinam -->|இல்லை| none["no rule fitted"]
```

`MAJORITY_PERCENT` is 40, and a share must be strictly above it. வெண்கலிப்பா uses the same strict test: above 50 for கலி+வெண் and above 25 for கலி alone. கலிவெண்பா uses above 90 for வெண்டளை. அளவடி is 4 seers. மேற்கதுவாய் is seers 1, 3, 4 and does not gate. வஞ்சித்தாழிசை is 12 குறளடி. சிந்தடி வஞ்சி கனி 7/18 is kept: the share is rounded to one tenth, so 0.4 passes and 6/18 does not. Every named leaf has one Avalokitam `/types` example. ஆசிரிய ஒத்தாழிசை is a note on ஆசிரியத் தாழிசை, not its own leaf.
