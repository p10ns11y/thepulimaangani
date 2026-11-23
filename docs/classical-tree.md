# Classical decision tree

The ML verdict stays the primary metre. `classical_tree` sits beside it. A family gate is the shared combined conditions. Each leaf then has one or two discriminating rules. Those rules are the last step in the trace, `{leaf}.discriminator`, and the last node before the leaf in the diagram. Any failed condition rejects that leaf. More combined conditions run first. Equal counts keep Avalokitam's order.

One picture of every leaf was a single narrow column, so the diagram is an overview plus one sub-diagram per family.

## Overview

Family gates in strict-first order. A failed family drops to the next. Equal condition counts keep Avalokitam's order. Leaf discriminators are in the family diagrams.

![Overview](classical-tree.svg)

[PNG](classical-tree.png)

```mermaid
%%{init: {"theme": "neutral", "themeVariables": {"fontFamily": "Noto Sans Tamil, Noto Sans, sans-serif", "fontSize": "15px"}, "flowchart": {"wrappingWidth": 420, "padding": 12, "htmlLabels": true, "curve": "linear", "nodeSpacing": 28, "rankSpacing": 36}}}%%
flowchart TD
  start["அடி<br/>சீர்<br/>தளை"]
  start --> aciriyappaa
  aciriyappaa["ஆசிரியப்பா<br/>8 combined<br/>3+ அடி<br/>இயற்சீர் மேல் 40<br/>ஆசிரியத்தளை மேல் 40<br/>ஈறு<br/>விளங்கனி இல்லை<br/>நீளம் இல்லை<br/>ஓர அளவடி<br/>இடை அடி"]
  aciriyappaa -->|இல்லை| kattalai_kalithurai
  kattalai_kalithurai["கட்டளைக்கலித்துறை<br/>6 combined<br/>4 நெடிலடி<br/>எதுகை<br/>16/17 எழுத்து<br/>அடிக்குள் வெண்"]
  kattalai_kalithurai -->|இல்லை| venpaa
  venpaa["வெண்பா<br/>4 combined<br/>ஈறு சிந்தடி<br/>உடல் சீர்<br/>வெண்டளை<br/>ஈற்றுச்சீர்"]
  venpaa -->|இல்லை| vanjippaa
  vanjippaa["வஞ்சிப்பா<br/>4 combined<br/>வஞ்சி அமைப்பு<br/>கனி பத்து<br/>வஞ்சித்தளை<br/>சுரிதகம்"]
  vanjippaa -->|இல்லை| aciriya_virutham
  aciriya_virutham["ஆசிரிய விருத்தம்<br/>4 combined<br/>4 சம அடி<br/>கழிநெடிலடி<br/>எதுகை"]
  aciriya_virutham -->|இல்லை| kattalai_kalippaa
  kattalai_kalippaa["கட்டளைக்கலிப்பா<br/>3 combined<br/>8 அரையடி<br/>4 சீர்<br/>11/12 எழுத்து"]
  kattalai_kalippaa -->|இல்லை| kalivenpaa_long_osai
  kalivenpaa_long_osai["கலிவெண்பா ஓசை<br/>2 combined<br/>13+ அடி<br/>ஈறு சிந்தடி"]
  kalivenpaa_long_osai -->|இல்லை| tharavukocha_kalippaa
  tharavukocha_kalippaa["தரவுகொச்சகம்<br/>2 combined<br/>4+ அளவடி"]
  tharavukocha_kalippaa -->|இல்லை| venkalippaa
  venkalippaa["வெண்கலிப்பா<br/>2 combined<br/>அளவடி+சிந்தடி<br/>உடல் சீர்"]
  venkalippaa -->|இல்லை| velivirutham
  velivirutham["வெளிவிருத்தம்<br/>2 combined<br/>3/4 நெடிலடி"]
  velivirutham -->|இல்லை| ventazhisai
  ventazhisai["வெண்டாழிசை<br/>2 combined<br/>3 அடி<br/>முதல் அளவடி"]
  ventazhisai -->|இல்லை| aciriya_thurai
  aciriya_thurai["ஆசிரியத் துறை<br/>2 combined<br/>4 அடி<br/>ஒரு அடி குறைவு"]
  aciriya_thurai -->|இல்லை| kurattazhisai
  kurattazhisai["குறட்டாழிசை<br/>1 combined<br/>2 அடி"]
  kurattazhisai -->|இல்லை| aciriya_thazhisai
  aciriya_thazhisai["ஆசிரியத் தாழிசை<br/>1 combined<br/>3 அடி"]
  aciriya_thazhisai -->|இல்லை| kalithurai
  kalithurai["கலித்துறை<br/>1 combined<br/>4 அடி"]
  kalithurai -->|இல்லை| kalivirutham
  kalivirutham["கலிவிருத்தம்<br/>1 combined<br/>4 அடி"]
  kalivirutham -->|இல்லை| vanjivirutham
  vanjivirutham["வஞ்சி விருத்தம்<br/>1 combined<br/>4 அடி"]
  vanjivirutham -->|இல்லை| vellathazhisai
  vellathazhisai["வெள்ளொத்தாழிசை<br/>1 combined<br/>9 அடி"]
  vellathazhisai -->|இல்லை| vendurai
  vendurai["வெண்டுறை<br/>1 combined<br/>3-7 அடி"]
  vendurai -->|இல்லை| kural_vensenthurai
  kural_vensenthurai["குறள் வெண்செந்துறை<br/>1 combined<br/>2 அடி"]
  kural_vensenthurai -->|இல்லை| kalithazhisai
  kalithazhisai["கலித்தாழிசை<br/>1 combined<br/>பல அடி"]
  kalithazhisai -->|இல்லை| vanjithazhisai
  vanjithazhisai["வஞ்சித்தாழிசை<br/>1 combined<br/>12 அடி"]
  vanjithazhisai -->|இல்லை| vanjithurai
  vanjithurai["வஞ்சித்துறை<br/>1 combined<br/>4 அடி"]
  vanjithurai -->|இல்லை| none["no rule fitted"]
```

## Venpaa

The வெண்பா gate is four combined conditions. Each leaf hangs off one discriminator node: line count, and for நேரிசை the தனிச்சொல் plus விகற்பம் mark. The long கலிவெண்பா ஓசை gate is separate; other families sit between it and the strict வெண்பா leaves.

![Venpaa](classical-tree-venpaa.svg)

[PNG](classical-tree-venpaa.png)

```mermaid
%%{init: {"theme": "neutral", "themeVariables": {"fontFamily": "Noto Sans Tamil, Noto Sans, sans-serif", "fontSize": "15px"}, "flowchart": {"wrappingWidth": 420, "padding": 12, "htmlLabels": true, "curve": "linear", "nodeSpacing": 28, "rankSpacing": 36}}}%%
flowchart TD
  venpaa["வெண்பா குடும்பம்<br/>ஈறு சிந்தடி; பிற அளவடி<br/>உடல் சீர் மா விளம் காய்<br/>தளை வெண்டளை<br/>ஈற்றுச்சீர் நாள் மலர் காசு பிறப்பு"]
  venpaa -->|பொருந்தும்| oru_vikarpa_kural_venpaa_disc
  venpaa -->|இல்லை| next_family["அடுத்த குடும்பம்"]
  oru_vikarpa_kural_venpaa_disc["இரண்டு அடி<br/>விகற்பம் ஒன்று"]
  oru_vikarpa_kural_venpaa_leaf["ஒரு விகற்ப குறள் வெண்பா"]
  oru_vikarpa_kural_venpaa_disc -->|பொருந்தும்| oru_vikarpa_kural_venpaa_leaf
  oru_vikarpa_kural_venpaa_disc -->|இல்லை| iru_vikarpa_kural_venpaa_disc
  iru_vikarpa_kural_venpaa_disc["இரண்டு அடி<br/>விகற்பம் இரண்டு அல்லது மேல்"]
  iru_vikarpa_kural_venpaa_leaf["இரு விகற்ப குறள் வெண்பா"]
  iru_vikarpa_kural_venpaa_disc -->|பொருந்தும்| iru_vikarpa_kural_venpaa_leaf
  iru_vikarpa_kural_venpaa_disc -->|இல்லை| nerisai_sinthiyal_venpaa_disc
  nerisai_sinthiyal_venpaa_disc["மூன்று அடி<br/>தனிச்சொல்<br/>விகற்பம் இரண்டுக்கு மிகாது"]
  nerisai_sinthiyal_venpaa_leaf["நேரிசை சிந்தியல் வெண்பா"]
  nerisai_sinthiyal_venpaa_disc -->|பொருந்தும்| nerisai_sinthiyal_venpaa_leaf
  nerisai_sinthiyal_venpaa_disc -->|இல்லை| oru_vikarpa_nerisai_venpaa_disc
  oru_vikarpa_nerisai_venpaa_disc["நான்கு அடி<br/>தனிச்சொல்<br/>விகற்பம் ஒன்று"]
  oru_vikarpa_nerisai_venpaa_leaf["ஒரு விகற்ப நேரிசை வெண்பா"]
  oru_vikarpa_nerisai_venpaa_disc -->|பொருந்தும்| oru_vikarpa_nerisai_venpaa_leaf
  oru_vikarpa_nerisai_venpaa_disc -->|இல்லை| iru_vikarpa_nerisai_venpaa_disc
  iru_vikarpa_nerisai_venpaa_disc["நான்கு அடி<br/>தனிச்சொல்<br/>விகற்பம் இரண்டு"]
  iru_vikarpa_nerisai_venpaa_leaf["இரு விகற்ப நேரிசை வெண்பா"]
  iru_vikarpa_nerisai_venpaa_disc -->|பொருந்தும்| iru_vikarpa_nerisai_venpaa_leaf
  iru_vikarpa_nerisai_venpaa_disc -->|இல்லை| oru_vikarpa_inisai_venpaa_disc
  oru_vikarpa_inisai_venpaa_disc["நான்கு அடி<br/>விகற்பம் ஒன்று"]
  oru_vikarpa_inisai_venpaa_leaf["ஒரு விகற்ப இன்னிசை வெண்பா"]
  oru_vikarpa_inisai_venpaa_disc -->|பொருந்தும்| oru_vikarpa_inisai_venpaa_leaf
  oru_vikarpa_inisai_venpaa_disc -->|இல்லை| inisai_sinthiyal_venpaa_disc
  inisai_sinthiyal_venpaa_disc["மூன்று அடி"]
  inisai_sinthiyal_venpaa_leaf["இன்னிசை சிந்தியல் வெண்பா"]
  inisai_sinthiyal_venpaa_disc -->|பொருந்தும்| inisai_sinthiyal_venpaa_leaf
  inisai_sinthiyal_venpaa_disc -->|இல்லை| pala_vikarpa_inisai_venpaa_disc
  pala_vikarpa_inisai_venpaa_disc["நான்கு அடி"]
  pala_vikarpa_inisai_venpaa_leaf["பல விகற்ப இன்னிசை வெண்பா"]
  pala_vikarpa_inisai_venpaa_disc -->|பொருந்தும்| pala_vikarpa_inisai_venpaa_leaf
  pala_vikarpa_inisai_venpaa_disc -->|இல்லை| paqrodai_venpaa_disc
  paqrodai_venpaa_disc["5-12 அடி"]
  paqrodai_venpaa_leaf["பஃறொடை வெண்பா"]
  paqrodai_venpaa_disc -->|பொருந்தும்| paqrodai_venpaa_leaf
  paqrodai_venpaa_disc -->|இல்லை| kalivenpaa_strict_disc
  kalivenpaa_strict_disc["13+ அடி"]
  kalivenpaa_strict_leaf["கலிவெண்பா"]
  kalivenpaa_strict_disc -->|பொருந்தும்| kalivenpaa_strict_leaf
  kalivenpaa_long_osai["கலிவெண்பா ஓசை<br/>13+ அடி<br/>ஈறு சிந்தடி"]
  kalivenpaa_long_osai_disc["வெண் மேல் 90<br/>கனி இல்லை"]
  kalivenpaa_long_osai_leaf["கலிவெண்பா"]
  kalivenpaa_long_osai -->|பொருந்தும்| kalivenpaa_long_osai_disc
  kalivenpaa_long_osai_disc -->|பொருந்தும்| kalivenpaa_long_osai_leaf
```

## Aciriyappaa

ஆசிரியப்பா shares eight conditions. The discriminator is where the short line sits. விருத்தம் then splits on சீர் count. தாழிசை and துறை split on line count and line length.

![Aciriyappaa](classical-tree-aciriyappaa.svg)

[PNG](classical-tree-aciriyappaa.png)

```mermaid
%%{init: {"theme": "neutral", "themeVariables": {"fontFamily": "Noto Sans Tamil, Noto Sans, sans-serif", "fontSize": "15px"}, "flowchart": {"wrappingWidth": 420, "padding": 12, "htmlLabels": true, "curve": "linear", "nodeSpacing": 28, "rankSpacing": 36}}}%%
flowchart TD
  aciriyappaa["ஆசிரியப்பா<br/>3+ அடி<br/>இயற்சீர் மேல் 40<br/>ஆசிரியத்தளை மேல் 40<br/>ஈறு ஏ ஓ ஈ ஆய் ஐ என்<br/>விளங்கனி இல்லை<br/>அளவடிக்கு மேல் நீளாது<br/>முதல் ஈறு அளவடி<br/>இடை அடி 2 3 4"]
  aciriyappaa -->|பொருந்தும்| nilaimandila_aciriyappaa_disc
  aciriyappaa -->|இல்லை| next_family["அடுத்த குடும்பம்"]
  nilaimandila_aciriyappaa_disc["குறுகிய அடி இல்லை"]
  nilaimandila_aciriyappaa_leaf["நிலைமண்டில ஆசிரியப்பா"]
  nilaimandila_aciriyappaa_disc -->|பொருந்தும்| nilaimandila_aciriyappaa_leaf
  nilaimandila_aciriyappaa_disc -->|இல்லை| nerisai_aciriyappaa_disc
  nerisai_aciriyappaa_disc["குறுகிய அடி<br/>ஈற்றயலடி மட்டும்"]
  nerisai_aciriyappaa_leaf["நேரிசை ஆசிரியப்பா"]
  nerisai_aciriyappaa_disc -->|பொருந்தும்| nerisai_aciriyappaa_leaf
  nerisai_aciriyappaa_disc -->|இல்லை| inaikkural_aciriyappaa_disc
  inaikkural_aciriyappaa_disc["குறுகிய அடி<br/>வேறு இடத்திலும்"]
  inaikkural_aciriyappaa_leaf["இணைக்குறள் ஆசிரியப்பா"]
  inaikkural_aciriyappaa_disc -->|பொருந்தும்| inaikkural_aciriyappaa_leaf
  aciriya_virutham["ஆசிரிய விருத்தம்<br/>4 சம அடி<br/>கழிநெடிலடி<br/>எதுகை"]
  aciriya_virutham -->|பொருந்தும்| arucir_kazhinediladi_aciriya_virutham_disc
  aciriya_virutham -->|இல்லை| next_family
  arucir_kazhinediladi_aciriya_virutham_disc["அறுசீர்"]
  arucir_kazhinediladi_aciriya_virutham_leaf["அறுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்"]
  arucir_kazhinediladi_aciriya_virutham_disc -->|பொருந்தும்| arucir_kazhinediladi_aciriya_virutham_leaf
  arucir_kazhinediladi_aciriya_virutham_disc -->|இல்லை| elucir_kazhinediladi_aciriya_virutham_disc
  elucir_kazhinediladi_aciriya_virutham_disc["எழுசீர்"]
  elucir_kazhinediladi_aciriya_virutham_leaf["எழுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்"]
  elucir_kazhinediladi_aciriya_virutham_disc -->|பொருந்தும்| elucir_kazhinediladi_aciriya_virutham_leaf
  elucir_kazhinediladi_aciriya_virutham_disc -->|இல்லை| encir_kazhinediladi_aciriya_virutham_disc
  encir_kazhinediladi_aciriya_virutham_disc["எண்சீர்"]
  encir_kazhinediladi_aciriya_virutham_leaf["எண்சீர் கழிநெடிலடி ஆசிரிய விருத்தம்"]
  encir_kazhinediladi_aciriya_virutham_disc -->|பொருந்தும்| encir_kazhinediladi_aciriya_virutham_leaf
  aciriya_thazhisai["ஆசிரியத் தாழிசை<br/>3 அடி"]
  aciriya_thazhisai_disc["சம அளவு<br/>குறளடி அல்லது மேல்"]
  aciriya_thazhisai_leaf["ஆசிரியத் தாழிசை"]
  aciriya_thazhisai -->|பொருந்தும்| aciriya_thazhisai_disc
  aciriya_thazhisai_disc -->|பொருந்தும்| aciriya_thazhisai_leaf
  aciriya_thurai["ஆசிரியத் துறை<br/>4 அடி<br/>ஒரு அடி குறைவு"]
  aciriya_thurai_disc["நீளம் இல்லை<br/>சம அடி உண்டு"]
  aciriya_thurai_leaf["ஆசிரியத் துறை"]
  aciriya_thurai -->|பொருந்தும்| aciriya_thurai_disc
  aciriya_thurai_disc -->|பொருந்தும்| aciriya_thurai_leaf
```

## Kalippaa

கட்டளைக்கலித்துறை is the heavy gate: the discriminator is the fifth seer and the ஏ ending. தாழிசை, துறை, and விருத்தம் split on line count and line length.

![Kalippaa](classical-tree-kalippaa.svg)

[PNG](classical-tree-kalippaa.png)

```mermaid
%%{init: {"theme": "neutral", "themeVariables": {"fontFamily": "Noto Sans Tamil, Noto Sans, sans-serif", "fontSize": "15px"}, "flowchart": {"wrappingWidth": 420, "padding": 12, "htmlLabels": true, "curve": "linear", "nodeSpacing": 28, "rankSpacing": 36}}}%%
flowchart TD
  kattalai_kalithurai["கட்டளைக்கலித்துறை<br/>4 நெடிலடி<br/>எதுகை<br/>16/17 எழுத்து<br/>அடிக்குள் வெண்<br/>பிற சீர் விளங்காய் அல்ல"]
  kattalai_kalithurai_disc["ஐந்தாம் சீர்<br/>ஈறு ஏ"]
  kattalai_kalithurai_leaf["கட்டளை கலித்துறை"]
  kattalai_kalithurai -->|பொருந்தும்| kattalai_kalithurai_disc
  kattalai_kalithurai_disc -->|பொருந்தும்| kattalai_kalithurai_leaf
  kattalai_kalithurai -->|இல்லை| kattalai_kalippaa
  kattalai_kalippaa["கட்டளைக்கலிப்பா<br/>8 அரையடி<br/>4 சீர்<br/>11/12 எழுத்து"]
  kattalai_kalippaa_disc["முதல் தளை ஆசிரியம்<br/>பின் தளை வெண்"]
  kattalai_kalippaa_leaf["கட்டளை கலிப்பா"]
  kattalai_kalippaa -->|பொருந்தும்| kattalai_kalippaa_disc
  kattalai_kalippaa_disc -->|பொருந்தும்| kattalai_kalippaa_leaf
  kattalai_kalippaa -->|இல்லை| tharavukocha_kalippaa
  tharavukocha_kalippaa["தரவுகொச்சகக் கலிப்பா<br/>4+ அடி<br/>அளவடி"]
  tharavukocha_kalippaa_disc["மா விளங்கனி இல்லை<br/>கலி மேல் 40"]
  tharavukocha_kalippaa_leaf["தரவுகொச்சகக் கலிப்பா"]
  tharavukocha_kalippaa -->|பொருந்தும்| tharavukocha_kalippaa_disc
  tharavukocha_kalippaa_disc -->|பொருந்தும்| tharavukocha_kalippaa_leaf
  tharavukocha_kalippaa -->|இல்லை| venkalippaa
  venkalippaa["வெண்கலிப்பா<br/>அளவடி மற்றும் சிந்தடி<br/>உடல் மா விளங்கனி இல்லை"]
  venkalippaa_disc["கலி+வெண் மேல் 50<br/>கலி மேல் 25"]
  venkalippaa_leaf["வெண்கலிப்பா"]
  venkalippaa -->|பொருந்தும்| venkalippaa_disc
  venkalippaa_disc -->|பொருந்தும்| venkalippaa_leaf
  venkalippaa -->|இல்லை| kalithurai
  kalithurai["கலித்துறை<br/>4 அடி"]
  kalithurai_disc["நெடிலடி<br/>எதுகை"]
  kalithurai_leaf["கலித்துறை"]
  kalithurai -->|பொருந்தும்| kalithurai_disc
  kalithurai_disc -->|பொருந்தும்| kalithurai_leaf
  kalithurai -->|இல்லை| kalivirutham
  kalivirutham["கலிவிருத்தம்<br/>4 அடி"]
  kalivirutham_disc["அளவடி<br/>எதுகை"]
  kalivirutham_leaf["கலிவிருத்தம்"]
  kalivirutham -->|பொருந்தும்| kalivirutham_disc
  kalivirutham_disc -->|பொருந்தும்| kalivirutham_leaf
  kalivirutham -->|இல்லை| kalithazhisai
  kalithazhisai["கலித்தாழிசை<br/>பல அடி"]
  kalithazhisai_disc["ஈறு பிற அடியை விட நீளம்"]
  kalithazhisai_leaf["கலித்தாழிசை"]
  kalithazhisai -->|பொருந்தும்| kalithazhisai_disc
  kalithazhisai_disc -->|பொருந்தும்| kalithazhisai_leaf
```

## Vanjippaa

வஞ்சிப்பா shares the skeleton. குறளடி and சிந்தடி are the discriminator. The பாவினம் leaves split on line count and line length.

![Vanjippaa](classical-tree-vanjippaa.svg)

[PNG](classical-tree-vanjippaa.png)

```mermaid
%%{init: {"theme": "neutral", "themeVariables": {"fontFamily": "Noto Sans Tamil, Noto Sans, sans-serif", "fontSize": "15px"}, "flowchart": {"wrappingWidth": 420, "padding": 12, "htmlLabels": true, "curve": "linear", "nodeSpacing": 28, "rankSpacing": 36}}}%%
flowchart TD
  vanjippaa["வஞ்சிப்பா<br/>வஞ்சி அடி தனிச்சொல் சுரிதகம்<br/>கனி பத்தில் 40<br/>வஞ்சித்தளை மேல் 40<br/>சுரிதக ஆசிரியத்தளை மேல் 40"]
  vanjippaa -->|பொருந்தும்| kuraladi_vanjippaa_disc
  kuraladi_vanjippaa_disc["குறளடி"]
  kuraladi_vanjippaa_leaf["குறளடி வஞ்சிப்பா"]
  kuraladi_vanjippaa_disc -->|பொருந்தும்| kuraladi_vanjippaa_leaf
  kuraladi_vanjippaa_disc -->|இல்லை| sinthadi_vanjippaa_disc
  sinthadi_vanjippaa_disc["சிந்தடி"]
  sinthadi_vanjippaa_leaf["சிந்தடி வஞ்சிப்பா"]
  sinthadi_vanjippaa_disc -->|பொருந்தும்| sinthadi_vanjippaa_leaf
  vanjippaa -->|இல்லை| vanjivirutham
  vanjivirutham["வஞ்சி விருத்தம்<br/>4 அடி"]
  vanjivirutham_disc["சிந்தடி<br/>எதுகை"]
  vanjivirutham_leaf["வஞ்சி விருத்தம்"]
  vanjivirutham -->|பொருந்தும்| vanjivirutham_disc
  vanjivirutham_disc -->|பொருந்தும்| vanjivirutham_leaf
  vanjivirutham -->|இல்லை| vanjithazhisai
  vanjithazhisai["வஞ்சித்தாழிசை<br/>12 அடி"]
  vanjithazhisai_disc["குறளடி"]
  vanjithazhisai_leaf["வஞ்சித்தாழிசை"]
  vanjithazhisai -->|பொருந்தும்| vanjithazhisai_disc
  vanjithazhisai_disc -->|பொருந்தும்| vanjithazhisai_leaf
  vanjithazhisai -->|இல்லை| vanjithurai
  vanjithurai["வஞ்சித்துறை<br/>4 அடி"]
  vanjithurai_disc["குறளடி"]
  vanjithurai_leaf["வஞ்சித்துறை"]
  vanjithurai -->|பொருந்தும்| vanjithurai_disc
  vanjithurai_disc -->|பொருந்தும்| vanjithurai_leaf
```

## Venpaavinam

வெளிவிருத்தம் is separated by one தனிச்சொல் and shared எதுகை. The other leaves are line count plus line length.

![Venpaavinam](classical-tree-venpaavinam.svg)

[PNG](classical-tree-venpaavinam.png)

```mermaid
%%{init: {"theme": "neutral", "themeVariables": {"fontFamily": "Noto Sans Tamil, Noto Sans, sans-serif", "fontSize": "15px"}, "flowchart": {"wrappingWidth": 420, "padding": 12, "htmlLabels": true, "curve": "linear", "nodeSpacing": 28, "rankSpacing": 36}}}%%
flowchart TD
  velivirutham["வெளிவிருத்தம்<br/>3 அல்லது 4 அடி<br/>நெடிலடி"]
  velivirutham_disc["ஒரே தனிச்சொல்<br/>எதுகை"]
  velivirutham_leaf["வெளிவிருத்தம்"]
  velivirutham -->|பொருந்தும்| velivirutham_disc
  velivirutham_disc -->|பொருந்தும்| velivirutham_leaf
  velivirutham -->|இல்லை| ventazhisai
  ventazhisai["வெண்டாழிசை<br/>3 அடி<br/>முதல் அடி அளவடி"]
  ventazhisai_disc["இரண்டாம் அடி அளவடி<br/>ஈறு சிந்தடி"]
  ventazhisai_leaf["வெண்டாழிசை"]
  ventazhisai -->|பொருந்தும்| ventazhisai_disc
  ventazhisai_disc -->|பொருந்தும்| ventazhisai_leaf
  ventazhisai -->|இல்லை| kurattazhisai
  kurattazhisai["குறட்டாழிசை<br/>2 அடி"]
  kurattazhisai_disc["முதல் அடி 4 சீர் அல்லது மேல்<br/>இரண்டாம் அடி குறைவு"]
  kurattazhisai_leaf["குறட்டாழிசை"]
  kurattazhisai -->|பொருந்தும்| kurattazhisai_disc
  kurattazhisai_disc -->|பொருந்தும்| kurattazhisai_leaf
  kurattazhisai -->|இல்லை| vellathazhisai
  vellathazhisai["வெள்ளொத்தாழிசை<br/>9 அடி"]
  vellathazhisai_disc["மூன்று வெண்பா அடுக்கு"]
  vellathazhisai_leaf["வெள்ளொத்தாழிசை"]
  vellathazhisai -->|பொருந்தும்| vellathazhisai_disc
  vellathazhisai_disc -->|பொருந்தும்| vellathazhisai_leaf
  vellathazhisai -->|இல்லை| vendurai
  vendurai["வெண்டுறை<br/>3-7 அடி"]
  vendurai_disc["ஒரே படி இறக்கம்"]
  vendurai_leaf["வெண்டுறை"]
  vendurai -->|பொருந்தும்| vendurai_disc
  vendurai_disc -->|பொருந்தும்| vendurai_leaf
  vendurai -->|இல்லை| kural_vensenthurai
  kural_vensenthurai["குறள் வெண்செந்துறை<br/>2 அடி"]
  kural_vensenthurai_disc["இரண்டும் சம அளவு"]
  kural_vensenthurai_leaf["குறள் வெண்செந்துறை"]
  kural_vensenthurai -->|பொருந்தும்| kural_vensenthurai_disc
  kural_vensenthurai_disc -->|பொருந்தும்| kural_vensenthurai_leaf
```

## Walk

The same order as a state chart. A state is a family gate or a leaf discriminator. பொருந்தும் ends on that leaf. இல்லை moves to the next discriminator. The family's இல்லை edge is the fall-through to the next family, including the miss after its last discriminator.

![Walk](classical-tree-walk.svg)

[PNG](classical-tree-walk.png)

Source: [classical-tree-walk.mmd](classical-tree-walk.mmd). `walk_state_chart_mermaid` writes it. `UPDATE_CLASSICAL_WALK=1 cargo test --lib walk_state_chart_matches_the_committed_diagram` refreshes the file. The PNG is rendered with [classical-tree-walk.css](classical-tree-walk.css) so the edge labels use Noto Sans Tamil.

## Decision routes

Each inconsistency is a named route in `tamil-seiyul-alagi/src/classical_decision.rs`. The trace records the route that is in force. A `decision.*` step means that route was the one applied.

| Inconsistency | Route in force | Source |
| --- | --- | --- |
| Shares above 40, 50, 25, and 90 | `ShareRoute::StrictAbove` | site |
| சிந்தடி வஞ்சி கனி, 7/18 passes and 6/18 fails | `ShareRoute::RoundToTenth` | site |
| அளவடி is 4 seers | `AlavadiWordRoute::FourSeers` | treatise |
| மேற்கதுவாய் seats 1, 3, 4 | `MerkathuvaiSeatRoute::TreatiseOneThreeFour` | treatise |
| Fifth seer accepts விளங்காய், மாங்கனி, and மாந்தண்பூ | `FifthSeerRoute::TreatisePlusSiteStandIns` | treatise and site |
| தரவுகொச்சகம் is four or more அளவடி | `TharavuAlavadiRoute::FourOrMore` | treatise |
| நேரிசை stays one mark and ties with குறள் | `NerisaiTieRoute::CombinedMarkAvalokitamRank` | site |
| Strict-first, Avalokitam rank on a tie | `WalkOrderRoute::StrictFirstAvalokitamTie` | site |
| Repeated line-final தனிச்சொல் on the four-line probe | `RepeatedTanicholRoute::KeepStrictFirstKattalai` | site |
| கலிவெண்பா strict versus long ஓசை, same leaf id | `decision.kalivenpaa_route` names the gate | site |

The four abstract order pairs are recorded as `decision.order.kattalai_kalithurai_velivirutham`, `decision.order.aciriyappaa_kural_venpaa`, `decision.order.kattalai_kalippaa_tharavu`, and `decision.order.vanjippaa_kalivenpaa_osai`.

Owner decision: four copies of `கனந்தரும் பூங்குழ லாளபி ராமி - கடைக்கண்களே` are strict-first கட்டளைக்கலித்துறை and Avalokitam வெளிவிருத்தம். The route in force keeps கட்டளைக்கலித்துறை. `RejectRepeatedLineFinalTanichol` and `VenpaaVinamBeforeKalippaaVinam` are named and not chosen; either one would move that leaf to வெளிவிருத்தம். The trace step is `decision.repeated_tanichol`.

பா over பாவினம் is an allowed overlap. Both orders return the பா: குறள் வெண்பா over குறட்டாழிசை, சிந்தியல் over வெண்டாழிசை and வெண்டுறை, தரவு over கலிவிருத்தம், ஆசிரியப்பா over துறை and தாழிசை. Those pairs are not order counterexamples.

`kalivenpaa_strict` and `kalivenpaa_long_osai` both report leaf id `kalivenpaa`. `decision.kalivenpaa_route` names which gate won.

## Inconsistencies

Site-tuned thresholds:

- இயற்சீர், ஆசிரியத்தளை, கலித்தளை, வஞ்சித்தளை, and சுரிதக ஆசிரியத்தளை must be strictly above 40. An exact 40 percent share fails.
- வெண்கலிப்பா must be strictly above 50 for கலி+வெண் and strictly above 25 for கலி alone.
- கலிவெண்பா's long ஓசை gate must be strictly above 90 வெண்டளை.
- சிந்தடி வஞ்சி கனி is the exception: 7/18 rounds to one tenth and passes; 6/18 rounds to 0.3 and fails. The other percent gates do not round.
- அளவடி is 4 seers. The site sometimes uses that word for a line in general.
- மேற்கதுவாய் is recorded as seers 1, 3, and 4. The site text says 1, 2, 3. It is a note, not a gate.
- கட்டளைக்கலித்துறை's fifth seer accepts விளங்காய் or the site's rare மாங்கனி and மாந்தண்பூ. The published example's last fifth seer is புளிமாங்கனி.
- தரவுகொச்சகக் கலிப்பா matches four or more அளவடி. The Tamil success line says நான்கு அளவடிக்கு மேல்.
- நேரிசை records தனிச்சொல் and விகற்பம் as one mark. Those three leaves therefore have 6 combined conditions and tie with குறள் வெண்பா. Avalokitam rank still tries குறள் first. The line counts do not overlap, so the leaf does not move.

Order-dependent verdicts. Avalokitam walks families first. Strict-first walks condition count first. Where those orders disagree:

- கட்டளைக்கலித்துறை (8) is before வெளிவிருத்தம் (4). Avalokitam checks வெளிவிருத்தம் first. Four copies of `கனந்தரும் பூங்குழ லாளபி ராமி - கடைக்கண்களே` (4 நெடிலடி, எதுகை, repeated line-final தனிச்சொல்) are the one poem that takes both gates. Strict-first returns கட்டளைக்கலித்துறை. Avalokitam returns வெளிவிருத்தம். The chosen route keeps கட்டளைக்கலித்துறை. The `/types` rows do not include this probe.
- ஆசிரியப்பா (9) is before வெண்பா. A குறள் still fails ஆசிரியப்பா because the last line is சிந்தடி, so the leaf stays குறள் வெண்பா.
- கட்டளைக்கலிப்பா (5) is before தரவுகொச்சகக் கலிப்பா (4). The published கட்டளை example has no கலித்தளை above 40, so தரவு fails and the leaf stays.
- வஞ்சிப்பா (5) is before the long கலிவெண்பா ஓசை gate (4). The published கலிவெண்பா has no வஞ்சி skeleton, so the leaf stays.
- Equal counts keep Avalokitam's order. வெண்கலிப்பா and வெண்டாழிசை both have 4 conditions, and வெண்கலிப்பா is still tried first.

All 36 `/types` examples keep the same leaf under both orders. ஆசிரிய ஒத்தாழிசை is a note on ஆசிரியத் தாழிசை, not its own leaf.
