//! Emit **OpenAPI 3.0.3** (`openapi` + `info` + `components.schemas`) wrapping the JSON Schema
//! for [`thepulimaangani_parser::types::ParseResult`] (serde WASM wire shape).
//!
//! Internal `$ref` strings use **`#/components/schemas/<Name>`**, matching OpenAPI 3 convention.
//!
//! Output path (repo root): `src/generated/parseResult.openapi.json`
//!
//! Run from repo root: `pnpm run codegen:parse-result-openapi` or
//! `cd tamil-seiyul-alagi && cargo run --example export_parse_result_openapi`

use std::fs;
use std::path::PathBuf;

use schemars::schema_for;
use serde_json::{json, Value};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let root = schema_for!(thepulimaangani_parser::types::ParseResult);
    let root_value = serde_json::to_value(&root)?;

    let mut schemas = openapi_schemas_from_root_schema(&root_value);
    rewrite_definitions_refs_to_components(&mut schemas);

    let openapi = json!({
        "openapi": "3.0.3",
        "info": {
            "title": "Thepulimaangani ParseResult (WASM JSON)",
            "description": "Machine-readable contract for `ParseResult` as produced by serde JSON from the Tamil parser / WASM. Regenerated from Rust via schemars; `components.schemas` holds JSON Schema keyword objects per OpenAPI 3.",
            "version": env!("CARGO_PKG_VERSION")
        },
        "paths": {},
        "components": {
            "schemas": schemas
        }
    });

    let out_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../src/generated/parseResult.openapi.json");
    if let Some(parent) = out_path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(&out_path, serde_json::to_string_pretty(&openapi)?)?;
    eprintln!("Wrote {}", out_path.display());
    Ok(())
}

/// Maps schemars [`RootSchema`](schemars::schema::RootSchema) JSON onto OpenAPI `components.schemas`.
fn openapi_schemas_from_root_schema(root_value: &Value) -> Value {
    let mut map = serde_json::Map::new();

    if let Some(defs) = root_value.get("definitions").and_then(|v| v.as_object()) {
        for (name, schema) in defs {
            map.insert(name.clone(), schema.clone());
        }
    }
    if let Some(defs) = root_value.get("$defs").and_then(|v| v.as_object()) {
        for (name, schema) in defs {
            map.insert(name.clone(), schema.clone());
        }
    }

    if let Some(schema_obj) = root_value.get("schema") {
        map.insert("ParseResult".to_string(), schema_obj.clone());
    }

    Value::Object(map)
}

/// Schemars emits `$ref` as `#/definitions/Foo`; OpenAPI 3 expects `#/components/schemas/Foo`.
fn rewrite_definitions_refs_to_components(schemas: &mut Value) {
    walk_replace_ref_strings(schemas);
}

fn walk_replace_ref_strings(value: &mut Value) {
    match value {
        Value::Object(map) => {
            for (key, child) in map.iter_mut() {
                if key == "$ref" {
                    if let Value::String(s) = child {
                        if let Some(rest) = s.strip_prefix("#/definitions/") {
                            *child = Value::String(format!("#/components/schemas/{rest}"));
                        }
                    }
                } else {
                    walk_replace_ref_strings(child);
                }
            }
        }
        Value::Array(items) => {
            for item in items.iter_mut() {
                walk_replace_ref_strings(item);
            }
        }
        _ => {}
    }
}
