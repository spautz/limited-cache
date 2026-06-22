import { withSkipTheBuild } from '@skip-the-build/vite';
import { defineConfig, type UserConfigFn } from 'vite';

import skipTheBuildSettings from '../../skip-the-build.ts';
import baseVitestConfig from '../../vitest.config.ts';

const vitestConfig: UserConfigFn = defineConfig(
  withSkipTheBuild(skipTheBuildSettings, baseVitestConfig),
);

export default vitestConfig;
