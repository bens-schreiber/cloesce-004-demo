# Issues and Constraints found with v0.0.4

- Can't make composite primary keys.

- Warning in generated code about incompatible types:

```
.generated/workers.ts:28:13 - error TS2345: Argument of type '{ hash: number; version: string; project_name: string; language: string; wrangler_env: { name: string; source_path: string; db_binding: string; }; models: { Course: { hash: number; name: string; primary_key: { ...; }; ... 5 more ...; source_path: string; }; ... 4 more ...; Rating: { ...; }; }; poos: {}; app_source: ...' is not assignable to parameter of type 'CloesceAst'.
  Types of property 'language' are incompatible.
    Type 'string' is not assignable to type '"TypeScript"'.

28             cidl,
               ~~~~
```

- Session support is needed for D1

- Data hydration should probably be in a session
