import { defineConfig, type UserConfig } from 'vite';

const viteConfig: UserConfig = defineConfig({
  build: {
    sourcemap: true,
  },
});

export default viteConfig;
