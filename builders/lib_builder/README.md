```json
{
  "scripts": {
    "build": "yarn build:esm-lib && yarn && yarn build:esm && yarn build:cjs",
    "build:cjs": "tsc --project tsconfig.cjs.json",
    "build:conversion-workspace": "deno run --allow-read --allow-write ./console/build_esm_lib.ts",
    "build:esm": "tsc --project tsconfig.esm.json",
    "build:esm-lib": "console/build_esm_lib ./src ./mod.ts --workspace=./tmp/conversion_workspace --debug",
    "build:windows": "bash console/build_esm_lib ./src ./mod.ts --workspace=./tmp/conversion_workspace --debug && yarn && yarn build:cjs && yarn build:esm",
    "release": "yarn publish --access public",
    "test": "yarn test:deno && yarn test:cjs && yarn test:esm",
    "test:cjs": "yarn jest tests/cjs/",
    "test:deno": "deno test -A tests/deno/",
    "test:esm": "yarn jest tests/esm/",
    "validate:nix": "rm -rf node_modules && rm yarn.lock && yarn build && yarn test"
  }
}
```
