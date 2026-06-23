import { withSkipTheBuild } from '@skip-the-build/vite';
import { defineConfig, type UserConfigFnPromise } from 'vite';

import skipTheBuildConfig from '../../skip-the-build.ts';

const viteConfig: UserConfigFnPromise = defineConfig(
  withSkipTheBuild(skipTheBuildConfig, {
    build: {
      sourcemap: true,
    },
  }),
);

export default viteConfig;
