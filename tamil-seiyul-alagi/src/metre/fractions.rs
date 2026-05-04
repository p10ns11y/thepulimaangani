use crate::linkage::{Linkage, LinkageType};

/// Coarse **Talai** family fractions over all linkage edges (Ven / Aciriya / Kali / Vanji).
pub fn linkage_coarse_fractions(linkage: &[Linkage]) -> (f32, f32, f32, f32) {
    let n = linkage.len().max(1) as f32;
    let mut vent = 0f32;
    let mut aasi = 0f32;
    let mut kal = 0f32;
    let mut vanj = 0f32;
    for e in linkage {
        match &e.linkage_type {
            LinkageType::VenTalai => vent += 1.0,
            LinkageType::AciriyaTalai => aasi += 1.0,
            LinkageType::KaliTalai => kal += 1.0,
            LinkageType::VanjiTalai => vanj += 1.0,
            LinkageType::Other(_) => {}
        }
    }
    (vent / n, aasi / n, kal / n, vanj / n)
}
