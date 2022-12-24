```json
{
  "scripts": {
    "build": "yarn build:esm-lib && yarn && yarn build:esm && yarn build:cjs",
    "build:cjs": "tsc --project tsconfig.cjs.json",
    "build:conversion-workspace": "deno run --allow-read --allow-write ./console/build_esm_lib.ts",
    "build:esm": "tsc --project tsconfig.esm.json",
    "build:esm-lib": "console/build_esm_lib ./src ./mod.ts --workspace=./tmp/conversion_workspace --debug",
    "build:windows": "bash console/build_esm_lib ./src ./mod.ts --workspace=./tmp/conversion_workspace --debug && yarn && yarn build:cjs && yarn build:esm"
  }
}
```
