---- MODULE ClassicalTreeWalk ----
\* Gate walk for the classical tree.
\* StrictOrder is more conditions first, then Avalokitam rank.
\* AvalOrder is Avalokitam rank only.
\* A gate's pass bit is independent of the others. Real poems exclude many
\* of those combinations. The overlap set is the over-approximation.

EXTENDS Integers, Sequences, FiniteSets, TLC

CONSTANT Mode

Gates == <<
  [id |-> "kalivenpaa_long_osai", rank |-> 0, count |-> 4],
  [id |-> "oru_vikarpa_kural_venpaa", rank |-> 1, count |-> 6],
  [id |-> "iru_vikarpa_kural_venpaa", rank |-> 2, count |-> 6],
  [id |-> "nerisai_sinthiyal_venpaa", rank |-> 3, count |-> 6],
  [id |-> "inisai_sinthiyal_venpaa", rank |-> 4, count |-> 5],
  [id |-> "oru_vikarpa_nerisai_venpaa", rank |-> 5, count |-> 6],
  [id |-> "iru_vikarpa_nerisai_venpaa", rank |-> 6, count |-> 6],
  [id |-> "oru_vikarpa_inisai_venpaa", rank |-> 7, count |-> 6],
  [id |-> "pala_vikarpa_inisai_venpaa", rank |-> 8, count |-> 5],
  [id |-> "paqrodai_venpaa", rank |-> 9, count |-> 5],
  [id |-> "kalivenpaa_strict", rank |-> 10, count |-> 5],
  [id |-> "nilaimandila_aciriyappaa", rank |-> 11, count |-> 9],
  [id |-> "nerisai_aciriyappaa", rank |-> 12, count |-> 9],
  [id |-> "inaikkural_aciriyappaa", rank |-> 13, count |-> 9],
  [id |-> "tharavukocha_kalippaa", rank |-> 14, count |-> 4],
  [id |-> "venkalippaa", rank |-> 15, count |-> 4],
  [id |-> "kuraladi_vanjippaa", rank |-> 16, count |-> 5],
  [id |-> "sinthadi_vanjippaa", rank |-> 17, count |-> 5],
  [id |-> "vellathazhisai", rank |-> 18, count |-> 2],
  [id |-> "velivirutham", rank |-> 19, count |-> 4],
  [id |-> "ventazhisai", rank |-> 20, count |-> 4],
  [id |-> "vendurai", rank |-> 21, count |-> 2],
  [id |-> "kural_vensenthurai", rank |-> 22, count |-> 2],
  [id |-> "kurattazhisai", rank |-> 23, count |-> 3],
  [id |-> "arucir_kazhinediladi_aciriya_virutham", rank |-> 24, count |-> 5],
  [id |-> "elucir_kazhinediladi_aciriya_virutham", rank |-> 25, count |-> 5],
  [id |-> "encir_kazhinediladi_aciriya_virutham", rank |-> 26, count |-> 5],
  [id |-> "aciriya_thazhisai", rank |-> 27, count |-> 3],
  [id |-> "aciriya_thurai", rank |-> 28, count |-> 4],
  [id |-> "kattalai_kalippaa", rank |-> 29, count |-> 5],
  [id |-> "kattalai_kalithurai", rank |-> 30, count |-> 8],
  [id |-> "kalithurai", rank |-> 31, count |-> 3],
  [id |-> "kalivirutham", rank |-> 32, count |-> 3],
  [id |-> "kalithazhisai", rank |-> 33, count |-> 2],
  [id |-> "vanjithazhisai", rank |-> 34, count |-> 2],
  [id |-> "vanjithurai", rank |-> 35, count |-> 2],
  [id |-> "vanjivirutham", rank |-> 36, count |-> 3]
>>

BeforeStrict(left, right) ==
  \/ left.count > right.count
  \/ (left.count = right.count /\ left.rank < right.rank)

BeforeAval(left, right) == left.rank < right.rank

RECURSIVE InsertStrict(_, _)
InsertStrict(seq, gate) ==
  IF seq = <<>> THEN <<gate>>
  ELSE IF BeforeStrict(gate, Head(seq)) THEN <<gate>> \o seq
  ELSE <<Head(seq)>> \o InsertStrict(Tail(seq), gate)

RECURSIVE SortStrict(_)
SortStrict(seq) ==
  IF seq = <<>> THEN <<>>
  ELSE InsertStrict(SortStrict(Tail(seq)), Head(seq))

RECURSIVE InsertAval(_, _)
InsertAval(seq, gate) ==
  IF seq = <<>> THEN <<gate>>
  ELSE IF BeforeAval(gate, Head(seq)) THEN <<gate>> \o seq
  ELSE <<Head(seq)>> \o InsertAval(Tail(seq), gate)

RECURSIVE SortAval(_)
SortAval(seq) ==
  IF seq = <<>> THEN <<>>
  ELSE InsertAval(SortAval(Tail(seq)), Head(seq))

StrictOrder == SortStrict(Gates)
AvalOrder == SortAval(Gates)

First(order, passing) ==
  LET hits == { index \in DOMAIN order : order[index].id \in passing }
  IN IF hits = {} THEN "none"
     ELSE order[CHOOSE index \in hits : \A other \in hits : index <= other].id

ExpectedOverlapCount == 142

IndexPairs ==
  { pair \in { <<left, right>> : left \in DOMAIN Gates, right \in DOMAIN Gates } :
      pair[1] < pair[2] }

DoubletonVerdicts ==
  { [strict |-> First(StrictOrder, {Gates[pair[1]].id, Gates[pair[2]].id}),
     aval |-> First(AvalOrder, {Gates[pair[1]].id, Gates[pair[2]].id})] :
      pair \in IndexPairs }

OverlapPairs == { verdict \in DoubletonVerdicts : verdict.strict # verdict.aval }

NamedOverlaps == {
  [strict |-> "kattalai_kalithurai", aval |-> "velivirutham"],
  [strict |-> "nilaimandila_aciriyappaa", aval |-> "oru_vikarpa_kural_venpaa"],
  [strict |-> "kattalai_kalippaa", aval |-> "tharavukocha_kalippaa"],
  [strict |-> "kuraladi_vanjippaa", aval |-> "kalivenpaa_long_osai"]
}

EveryLeaf ==
  \A index \in DOMAIN Gates :
    /\ First(StrictOrder, {Gates[index].id}) = Gates[index].id
    /\ First(AvalOrder, {Gates[index].id}) = Gates[index].id

NamedAreOverlaps == NamedOverlaps \subseteq OverlapPairs

OverlapCount == Cardinality(OverlapPairs) = ExpectedOverlapCount

\* If the two winners differ, that winner pair is one of the overlap pairs.
AgreeOnDoubletons ==
  \A left \in DOMAIN Gates, right \in DOMAIN Gates :
    LET passing == {Gates[left].id, Gates[right].id}
        strictGateId == First(StrictOrder, passing)
        avalGateId == First(AvalOrder, passing)
    IN \/ strictGateId = avalGateId
       \/ [strict |-> strictGateId, aval |-> avalGateId] \in OverlapPairs

\* False on the current tree. The counterexample config shows one pair.
AlwaysAgree ==
  \A left \in DOMAIN Gates, right \in DOMAIN Gates :
    First(StrictOrder, {Gates[left].id, Gates[right].id})
      = First(AvalOrder, {Gates[left].id, Gates[right].id})

ASSUME PrintT(<<"overlap_count", Cardinality(OverlapPairs)>>)
ASSUME PrintT(<<"named_overlaps", NamedOverlaps>>)

VARIABLES phase, strictGate, avalGate

vars == <<phase, strictGate, avalGate>>

Init == phase = "ready" /\ strictGate = "none" /\ avalGate = "none"

PickDisagreement ==
  \E left \in DOMAIN Gates, right \in DOMAIN Gates :
    /\ left < right
    /\ LET passing == {Gates[left].id, Gates[right].id}
           strictGateId == First(StrictOrder, passing)
           avalGateId == First(AvalOrder, passing)
       IN /\ strictGateId # avalGateId
          /\ phase' = "done"
          /\ strictGate' = strictGateId
          /\ avalGate' = avalGateId

PassStep ==
  \/ /\ phase = "ready"
     /\ phase' = "done"
     /\ UNCHANGED <<strictGate, avalGate>>
  \/ /\ phase = "done"
     /\ UNCHANGED vars

CounterStep ==
  \/ /\ phase = "ready"
     /\ PickDisagreement
  \/ /\ phase = "done"
     /\ UNCHANGED vars

Next == IF Mode = "pass" THEN PassStep ELSE CounterStep

Spec == Init /\ [][Next]_vars

NoDisagreement == strictGate = "none"

====
