// biome-ignore-all lint/performance/noDelete: Remove development-only fields

export default {
  hooks: {
    beforePacking(pkg) {
      delete pkg.devDependencies;
      delete pkg.scripts;
      delete pkg['size-limit'];

      // Add publication metadata
      pkg.publishedAt = new Date().toISOString();

      return pkg;
    },
  },
};
