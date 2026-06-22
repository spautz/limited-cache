#!/usr/bin/env node
/** biome-ignore-all lint/suspicious/noConsole: This is a shell script */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;
type DependencyField = (typeof DEPENDENCY_FIELDS)[number];

type PackageManifest = Partial<Record<DependencyField, Record<string, string>>>;
type Policy = { prefix: string; allowedCatalogs: Set<string> };

// NOTE: The library-specific ("isolated") catalogs help with isolated testing
const ALLOW_TESTING_CATALOGS = false;
const isolatedTestingCatalogs = ['react16', 'react17', 'react18', 'react19', 'typescriptLTS'];

const defaultAllowedCatalogs = [
  'shared',
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  ...(ALLOW_TESTING_CATALOGS ? isolatedTestingCatalogs : []),
];

const policyByPrefix: Policy[] = [
  {
    prefix: 'packages/',
    allowedCatalogs: new Set(['packages', ...defaultAllowedCatalogs]),
  },
  {
    prefix: 'demos/',
    allowedCatalogs: new Set(['demos', ...defaultAllowedCatalogs]),
  },
  {
    prefix: 'docs-website/',
    allowedCatalogs: new Set(['packages', ...defaultAllowedCatalogs]),
  },
];

const explicitPolicyByPath = new Map<string, Set<string>>([
  ['package.json', new Set(['packages', ...defaultAllowedCatalogs])],
]);

function collectPackageJsonPaths(rootDir: string): string[] {
  const paths = ['package.json', 'docs-website/package.json'];

  for (const segment of ['packages', 'demos']) {
    const parent = path.join(rootDir, segment);
    if (!existsSync(parent)) continue;

    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const relative = `${segment}/${entry.name}/package.json`;
      const absolute = path.join(rootDir, relative);
      if (existsSync(absolute)) paths.push(relative);
    }
  }

  return paths;
}

function getAllowedCatalogs(relativePath: string): Set<string> | null {
  const explicit = explicitPolicyByPath.get(relativePath);
  if (explicit) return explicit;

  for (const policy of policyByPrefix) {
    if (relativePath.startsWith(policy.prefix)) return policy.allowedCatalogs;
  }

  return null;
}

function findCatalogIssues(relativePath: string, pkg: PackageManifest): string[] {
  const issues: string[] = [];
  const allowedCatalogs = getAllowedCatalogs(relativePath);
  if (!allowedCatalogs) return issues;

  for (const field of DEPENDENCY_FIELDS) {
    const dependencies = pkg[field];
    if (!dependencies || typeof dependencies !== 'object') continue;

    for (const [depName, versionSpec] of Object.entries(dependencies)) {
      if (typeof versionSpec !== 'string' || !versionSpec.startsWith('catalog:')) continue;

      if (versionSpec === 'catalog:') {
        issues.push(
          `${relativePath} -> ${field}.${depName}: bare "catalog:" is disallowed; use an explicit named catalog`,
        );
        continue;
      }

      const catalogName = versionSpec.slice('catalog:'.length);
      if (!allowedCatalogs.has(catalogName)) {
        const allowed = [...allowedCatalogs].sort().join(', ');
        issues.push(
          `${relativePath} -> ${field}.${depName}: catalog "${catalogName}" is not allowed for this path (allowed: ${allowed})`,
        );
      }
    }
  }

  return issues;
}

function main(): void {
  const rootDir = process.cwd();
  const packageJsonPaths = collectPackageJsonPaths(rootDir);
  const issues: string[] = [];

  for (const relativePath of packageJsonPaths) {
    const absolutePath = path.join(rootDir, relativePath);
    const json = readFileSync(absolutePath, 'utf8');
    const pkg = JSON.parse(json) as PackageManifest;
    issues.push(...findCatalogIssues(relativePath, pkg));
  }

  if (issues.length > 0) {
    console.error('Catalog policy violations found:');
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `Catalog policy check passed (${packageJsonPaths.length} package.json files checked).`,
  );
}

main();
