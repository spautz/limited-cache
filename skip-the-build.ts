import { defineSkipTheBuildConfig, presets, type SkipTheBuildConfig } from 'skip-the-build';

const skipTheBuildSettings: SkipTheBuildConfig = defineSkipTheBuildConfig({
  // When enabled, apps will *directly consume* packages' source code,
  // instead of going through the package's `dist/`.
  // This is orders of magnitude faster for local dev, but it can conceal
  // mistakes because it's not how real packages work.
  // By default it's enabled for local dev and disabled for CI.
  extend: presets.default,
  settings: {
    exportConditionName: 'local-dev',
    validateConfig: false,
  },
});

export default skipTheBuildSettings;
