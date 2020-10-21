import { Rhum } from "https://raw.githubusercontent.com/drashland/rhum/rhum-cli/mod.ts";
import { BumperService } from "../../ci/bumper_service.ts";

const b = new BumperService("rhum", []);
const c = new BumperService("rhum", ["--version=v1.2.3"]);

Rhum.testPlan(() => {
  Rhum.testSuite("constructor()", () => {
    Rhum.testCase("sets module_name", () => {
      Rhum.asserts.assertEquals(
        b.getModuleName(),
        "rhum",
      );
    });
    Rhum.testCase("sets parsed_args", () => {
      Rhum.asserts.assertEquals(
        b.getParsedArgs(),
        {},
      );
      Rhum.asserts.assertEquals(
        c.getParsedArgs(),
        {
          branch: "v1.2.3",
        },
      );
    });
    Rhum.testCase("sets is_for_pre_release", () => {
      Rhum.asserts.assertEquals(
        b.isForPreRelease(),
        false,
      );
      Rhum.asserts.assertEquals(
        c.isForPreRelease(),
        true,
      );
    });
    Rhum.testCase("sets latest_versions", async () => {
      const versions = {
        rhum: await c.getModulesLatestVersion("rhum"),
        deno: await c.getModulesLatestVersion("deno"),
        deno_std: await c.getModulesLatestVersion("std"),
      };
      Rhum.asserts.assertEquals(
        await c.getLatestVersions(),
        versions,
      );
    });
  });

  Rhum.testSuite("bump() (with is_for_pre_release = false)", async () => {
    const files = await b.bump([
      {
        filename: "./tests/data/master.yml",
        replaceTheRegex: /deno: ["[0-9.]+[0-9.]+[0-9]"]/g,
        replaceWith: `deno: ["{{ latestDenoVersion }}"]`,
      },
      {
        filename: "./tests/data/bumper.yml",
        replaceTheRegex: /deno: ["[0-9.]+[0-9.]+[0-9]"]/g,
        replaceWith: `deno: ["{{ latestDenoVersion }}"]`,
      },
      {
        filename: "./tests/data/pre_release.yml",
        replaceTheRegex: /deno: ["[0-9.]+[0-9.]+[0-9]"]/g,
        replaceWith: `deno: ["{{ latestDenoVersion }}"]`,
      },
    ], false);

    const master = files[0];
    const bumper = files[1];
    const preRelease = files[2];

    Rhum.testCase("bumps master.yml correctly", () => {
      Rhum.asserts.assertEquals(master, data_bumpMaster);
    });
    Rhum.testCase("bumps bumper.yml correctly", () => {
      Rhum.asserts.assertEquals(bumper, data_bumpBumper);
    });
    Rhum.testCase("bumps pre_release.yml correctly", () => {
      Rhum.asserts.assertEquals(preRelease, data_bumpPreRelease);
    });
  });

  Rhum.testSuite("bump (with is_for_pre_release = true)", () => {
    const d = new BumperService("SOMECOOLMODULENAME", ["--version=v1.2.3"]);

    const files = await d.bump([
      {
        filename: "./tests/data/README.md",
        replaceTheRegex: new RegExp(
          `import { Rhum } from "https://deno.land/x/rhum@v1.1.4/mod.ts`,
          "g",
        ),
        replaceWith:
          `import { Rhum } from "https://deno.land/x/rhum@v{{ thisModulesLatestVersion }}/mod.ts`,
      },
      {
        filename: "./tests/data/egg.json",
        replaceTheRegex: /"version": "[0-9\.]+[0-9\.]+[0-9\.]"/,
        replaceWith: `"version": "{{ thisModulesLatestVersion }}"`,
      },
      {
        filename: "./tests/data/mod.ts",
        replaceTheRegex: /version = ".+"/,
        replaceWith: `version = "{{ thisModulesLatestVersion }}"`,
      },
    ], false);

    const readme = files[0];
    const eggJson = files[1];
    const mod = files[2];

    Rhum.testCase("bumps README.md correctly", () => {
      Rhum.asserts.assertEquals(readme, data_bumpMaster);
    });
    Rhum.testCase("bumps egg.json correctly", () => {
      Rhum.asserts.assertEquals(eggJson, data_bumpBumper);
    });
    Rhum.testCase("bumps mod.ts correctly", () => {
      Rhum.asserts.assertEquals(mod, data_bumpPreRelease);
    });
  });
});

////////////////////////////////////////////////////////////////////////////////
// DATA PROVIDERS //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const latestVersions = await c.getLatestVersions();

const data_bumpMaster = `name: master

on:
  pull_request:
    branches:
      - master
  push:
    branches:
      - master

jobs:
  tests:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        deno: ["${latestVersions.deno}"]
    runs-on: $\{{ matrix.os }}

    steps:
      - uses: actions/checkout@v2

      - name: Install Deno v$\{{ matrix.deno }}
        uses: denolib/setup-deno@master
        with:
          deno-version: $\{{ matrix.deno }}

      - name: Install Rhum
        run: deno install -A ./cli.ts

      - name: Run Unit Tests
        if: matrix.os != 'windows-latest'
        run: |
          export PATH="~/.deno/bin:$PATH"
          rhum tests/unit

      - name: Run Integration Tests
        if: matrix.os != 'windows-latest'
        run: |
          export PATH="~/.deno/bin:$PATH"
          rhum tests/integration

      - name: Run Unit Tests (windows)
        if: matrix.os == 'windows-latest'
        run: |
          $env:Path += ";C:\\Users\\runneradmin\\.deno\\bin"
          rhum tests/unit

      - name: Run Integration Tests (windows)
        if: matrix.os == 'windows-latest'
        run: |
          $env:Path += ";C:\\Users\\runneradmin\\.deno\\bin"
          rhum tests/integration

  linter:
    strategy:
      matrix:
        deno: ["${latestVersions.deno}"]
    # Only one OS is required since fmt is cross platform
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Install Deno v$\{{ matrix.deno }}
        uses: denolib/setup-deno@master
        with:
          deno-version: $\{{ matrix.deno }}

      - name: Lint
        run: deno lint --unstable

      - name: Formatter
        run: deno fmt --check
`;

const data_bumpBumper = `name: bumper
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  update-dep:
    strategy:
      matrix:
        deno: ["${latestVersions.deno}"]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install Deno
        uses: denolib/setup-deno@master
        with:
          deno-version: $\{{ matrix.deno }}

      - name: Update Dependencies
        run: deno run --allow-net --allow-read --allow-write https://deno.land/x/dmm/mod.ts update

      - name: Bump Versions
        run: deno run -A ./console/bumper_ci_service.ts

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v2
        with:
          token: $\{{ secrets.CI_USER_PAT }}
          commit-message: Update dependencies
          title: Update dependencies
          body: This was auto-generated by GitHub Actions.
          branch: update-dependencies
`;

const data_bumpPreRelease = `name: pre-release

on:
  create

jobs:

  # Make a PR to master from a new branch with changes, and delete the created one
  update-versions:

    # Only run when a release-v* branch is created, and not by drashbot
    if: contains(github.ref, 'release-v') && !contains(github.event.sender.login, 'drashbot')

    strategy:
      matrix:
        deno: ["${latestVersions.deno}"]

    runs-on: ubuntu-latest

    steps:

      - name: Checkout master
        uses: actions/checkout@v2
        with:
          ref: master

      - name: Delete Remote Release Branch
        run: git push --delete origin $\{{ github.ref }}

      - name: Install Deno
        uses: denolib/setup-deno@v2
        with:
          deno-version: $\{{ matrix.deno }}

      - name: Bump Versions
        run: deno run -A ./console/bumper_ci_service.ts --version=$\{{ github.ref }} # version passed so we know what the new release version will be

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v2
        with:
          token: $\{{ secrets.CI_USER_PAT }}
          commit-message: bump versions
          title: bump versions
          body: This was auto-generated by GitHub Actions.
          branch: release # Can change it to $\{{ github.ref }} to be the branch name, but then we need to figure out how to stop this worjflow running  when it creates another "release-vx.x.x" branch
`;
