//! Unit tests mirroring arch-machine eye-comfort `test_tamil_schedule.py` (calendar bits).

use chrono::NaiveDate;
use tamil_time::{
    infer_tinai, jaamam_detail_for, jaamam_index_at, jaamam_split_for_siru, nazhigai_in_siru,
    nazhigai_of_day, nazhigai_ordinal, nazhigai_running_copy, parse_siru, parse_tinai,
    perum_for_date, resolve_tamil_at, scene_line, siru_for_hour, wallpaper_fallback_names, Perum,
    ResolveInput, Siru, Tinai, TinaiSource, SIRU,
};

#[test]
fn perum_windows() {
    assert_eq!(
        perum_for_date(NaiveDate::from_ymd_opt(2026, 5, 1).unwrap()),
        Perum::IlaVenil
    );
    assert_eq!(
        perum_for_date(NaiveDate::from_ymd_opt(2026, 7, 1).unwrap()),
        Perum::MudhuVenil
    );
    assert_eq!(
        perum_for_date(NaiveDate::from_ymd_opt(2026, 9, 1).unwrap()),
        Perum::Kar
    );
    assert_eq!(
        perum_for_date(NaiveDate::from_ymd_opt(2026, 11, 1).unwrap()),
        Perum::Kulir
    );
    assert_eq!(
        perum_for_date(NaiveDate::from_ymd_opt(2026, 1, 10).unwrap()),
        Perum::Munpani
    );
    assert_eq!(
        perum_for_date(NaiveDate::from_ymd_opt(2026, 3, 1).unwrap()),
        Perum::Pinpani
    );
    assert_eq!(
        perum_for_date(NaiveDate::from_ymd_opt(2026, 4, 15).unwrap()),
        Perum::IlaVenil
    );
    assert_eq!(
        perum_for_date(NaiveDate::from_ymd_opt(2026, 4, 14).unwrap()),
        Perum::Pinpani
    );
    assert_eq!(
        perum_for_date(NaiveDate::from_ymd_opt(2026, 12, 15).unwrap()),
        Perum::Munpani
    );
}

#[test]
fn siru_windows() {
    assert_eq!(siru_for_hour(3, 0).unwrap(), Siru::Vidiyal);
    assert_eq!(siru_for_hour(7, 0).unwrap(), Siru::Kaalai);
    assert_eq!(siru_for_hour(12, 0).unwrap(), Siru::Nanpagal);
    assert_eq!(siru_for_hour(15, 0).unwrap(), Siru::Erpaadu);
    assert_eq!(siru_for_hour(19, 0).unwrap(), Siru::Maalai);
    assert_eq!(siru_for_hour(23, 0).unwrap(), Siru::Yaamam);
    assert_eq!(siru_for_hour(1, 0).unwrap(), Siru::Yaamam);
    assert_eq!(siru_for_hour(2, 0).unwrap(), Siru::Vidiyal);
    assert_eq!(siru_for_hour(5, 59).unwrap(), Siru::Vidiyal);
    assert_eq!(siru_for_hour(6, 0).unwrap(), Siru::Kaalai);
}

#[test]
fn nazhigai_steps() {
    assert_eq!(nazhigai_in_siru(10, 0, None).unwrap(), 0);
    assert_eq!(nazhigai_in_siru(10, 24, None).unwrap(), 1);
    assert_eq!(nazhigai_in_siru(13, 36, None).unwrap(), 9);
    assert_eq!(nazhigai_in_siru(22, 0, None).unwrap(), 0);
    assert_eq!(nazhigai_in_siru(22, 48, None).unwrap(), 2);
    let n = nazhigai_in_siru(1, 0, None).unwrap();
    assert!((0..=9).contains(&n));
    assert_eq!(nazhigai_of_day(0, 0), 0);
    assert_eq!(nazhigai_of_day(0, 24), 1);
    assert_eq!(nazhigai_of_day(23, 59), 59);
    assert_eq!(nazhigai_ordinal(0).unwrap(), 1);
    assert_eq!(nazhigai_ordinal(1).unwrap(), 2);
    assert_eq!(nazhigai_ordinal(9).unwrap(), 10);
    assert_eq!(
        nazhigai_running_copy(1).unwrap(),
        "Running Nazhigai 2 (after 24 minutes, first nazhigai over)"
    );
}

#[test]
fn jaamam_splits_match_design() {
    let v = jaamam_split_for_siru(Siru::Vidiyal);
    assert_eq!(v.len(), 2);
    assert!(v[0].full && (v[0].nazhigai - 7.5).abs() < 1e-9 && v[0].index == 1);
    assert!(!v[1].full && (v[1].nazhigai - 2.5).abs() < 1e-9 && v[1].index == 2);

    let k = jaamam_split_for_siru(Siru::Kaalai);
    assert_eq!(k.len(), 2);
    assert!((k[0].nazhigai - 5.0).abs() < 1e-9 && (k[1].nazhigai - 5.0).abs() < 1e-9);

    let n = jaamam_split_for_siru(Siru::Nanpagal);
    assert!(n[1].full && n[1].index == 4);

    let y = jaamam_split_for_siru(Siru::Yaamam);
    assert!(y[1].full && y[1].index == 8);

    assert_eq!(jaamam_index_at(2, 0).unwrap(), 1);
    assert_eq!(jaamam_index_at(5, 0).unwrap(), 2);
    assert_eq!(jaamam_index_at(1, 0).unwrap(), 8);
}

#[test]
fn all_siru_have_jaamam_parts() {
    for siru in SIRU {
        let parts = jaamam_split_for_siru(siru);
        assert!(!parts.is_empty(), "{siru}");
        let d = jaamam_detail_for(siru, 0).unwrap();
        assert!((1..=8).contains(&d.current));
        assert!(d.label.contains("jaamam"));
    }
}

#[test]
fn infer_tinai_geo() {
    let (t, src) = infer_tinai(Some(13.0), Some(80.2), None).unwrap();
    assert_eq!(t, Tinai::Neythal);
    assert_eq!(src, TinaiSource::Geo);
    let (t2, _) = infer_tinai(Some(11.4), Some(76.7), None).unwrap();
    assert_eq!(t2, Tinai::Kurinji);
    let (t3, src3) = infer_tinai(None, None, None).unwrap();
    assert_eq!(t3, Tinai::Marutham);
    assert_eq!(src3, TinaiSource::Default);
    let (t4, _) = infer_tinai(Some(10.0), Some(78.1), Some(Perum::MudhuVenil)).unwrap();
    assert_eq!(t4, Tinai::Palai);
}

#[test]
fn wallpaper_fallback_chain() {
    let names = wallpaper_fallback_names("marutham-erpaadu-b.jpg");
    assert_eq!(names[0], "marutham-erpaadu-b.jpg");
    assert!(names.iter().any(|n| n == "marutham-erpaadu-a.jpg"));
    assert!(names.iter().any(|n| n == "marutham-vidiyal-a.jpg"));
    assert!(names.iter().any(|n| n == "marutham-default.jpg"));
}

#[test]
fn resolve_flags_and_scene() {
    let on = NaiveDate::from_ymd_opt(2026, 7, 14).unwrap();
    let s = resolve_tamil_at(
        &ResolveInput {
            tinai: Some("neythal".into()),
            hour: Some(15),
            minute: 0,
            ..Default::default()
        },
        on,
        0,
        0,
    )
    .unwrap();
    assert_eq!(s.tinai, Tinai::Neythal);
    assert_eq!(s.siru, Siru::Erpaadu);
    assert_eq!(s.theme, "eye-comfort-tn-neythal");
    assert_eq!(s.phase.as_str(), "afternoon");
    assert!(s.wallpaper_hint.contains("neythal-erpaadu"));
    assert!(s.jaamam.label.contains("jaamam"));

    let s2 = resolve_tamil_at(
        &ResolveInput {
            hour: Some(23),
            minute: 0,
            latitude: Some(11.0),
            longitude: Some(76.5),
            ..Default::default()
        },
        on,
        0,
        0,
    )
    .unwrap();
    assert_eq!(s2.siru, Siru::Yaamam);
    assert_eq!(s2.tinai, Tinai::Kurinji);

    let s3 = resolve_tamil_at(
        &ResolveInput {
            siru: Some("maalai".into()),
            nazhigai: Some(3),
            tinai: Some("mullai".into()),
            ..Default::default()
        },
        on,
        0,
        0,
    )
    .unwrap();
    assert!(s3
        .scene
        .contains("Running Nazhigai 4 (after 72 minutes, first 3 nazhigai over)"));

    let s5 = resolve_tamil_at(
        &ResolveInput {
            siru: Some("nanpagal".into()),
            nazhigai: Some(5),
            tinai: Some("marutham".into()),
            ..Default::default()
        },
        on,
        0,
        0,
    )
    .unwrap();
    assert!(s5
        .scene
        .contains("Running Nazhigai 6 (after 120 minutes, first 5 nazhigai over)"));
}

#[test]
fn parse_aliases() {
    assert_eq!(parse_tinai("neytal").unwrap(), Tinai::Neythal);
    assert_eq!(parse_siru("yamam").unwrap(), Siru::Yaamam);
    assert_eq!(parse_siru("dawn").unwrap(), Siru::Vidiyal);
}

#[test]
fn scene_vidiyal_example() {
    let line = scene_line(
        Tinai::Marutham,
        Perum::MudhuVenil,
        Siru::Vidiyal,
        0,
        None,
    )
    .unwrap();
    assert!(line.contains("jaamam 1 (full) + jaamam 2 (2.5 nazhigai)"));
    assert!(line.starts_with("plains · marutham · vidiyal"));
}

#[test]
fn bad_inputs() {
    let on = NaiveDate::from_ymd_opt(2026, 1, 1).unwrap();
    assert!(resolve_tamil_at(
        &ResolveInput {
            nazhigai: Some(12),
            ..Default::default()
        },
        on,
        12,
        0,
    )
    .is_err());
    assert!(resolve_tamil_at(
        &ResolveInput {
            tinai: Some("atlantis".into()),
            ..Default::default()
        },
        on,
        12,
        0,
    )
    .is_err());
    assert!(siru_for_hour(25, 0).is_err());
}
