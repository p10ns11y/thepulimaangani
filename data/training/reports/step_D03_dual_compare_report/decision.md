# D03 dual compare report

Policy: ML scores parallel to classical violations (never fused).  
Uses `dual_compare_label` on live special_type parses.

| sample_id | gold | ml_pred | dual_compare |
|-----------|------|---------|--------------|
| oru_vikarpa_kural_venpaa | Venpaa | Venpaa | agree |
| iru_vikarpa_kural_venpaa | Venpaa | Venpaa | agree |
| nerisai_sinthiyal_venpaa | Venpaa | Venpaa | agree |
| inisai_sinthiyal_venpaa | Venpaa | Venpaa | agree |
| oru_vikarpa_nerisai_venpaa | Venpaa | Venpaa | agree |
| iru_vikarpa_nerisai_venpaa | Venpaa | Venpaa | agree |
| oru_vikarpa_inisai_venpaa | Venpaa | Venpaa | agree |
| pala_vikarpa_inisai_venpaa | Venpaa | Venpaa | agree |
| paqrodai_venpaa | Venpaa | Venpaa | ml_only_classical_flags |
| kalivenpaa | Venpaa | Venpaa | ml_only_classical_flags |
| nerisai_aciriyappaa | Aciriyappaa | Aciriyappaa | agree |
| inaikkural_aciriyappaa | Aciriyappaa | Aciriyappaa | agree |
| nilaimandila_aciriyappaa | Aciriyappaa | Aciriyappaa | agree |
| tharavukocha_kalippaa | Kalippaa | Kalippaa | agree |
| venkalippaa | Kalippaa | Kalippaa | agree |
| kuraladi_vanjippaa | Vanjippaa | Vanjippaa | agree |
| sinthadi_aciriyappaa | Vanjippaa | Vanjippaa | agree |
