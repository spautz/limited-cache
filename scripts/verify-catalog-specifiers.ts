#!/usr/bin/env node
/** biome-ignore-all lint/suspicious/noConsole: This is a shell script */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';

const DEPENDENCY_FIELD_NAMES = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;
type DependencyFieldName = (typeof DEPENDENCY_FIELD_NAMES)[number];

type PackageManifest = Partial<Record<DependencyFieldName, Record<string, string>>>;
type Policy = {
  pathPattern: string;
  allowedCatalogs: Set<string>;
};
type PolicyWithFiles = Policy & { files: string[] };

// NOTE: The library-specific ("isolated") catalogs help with isolated testing
const ALLOW_TESTING_CATALOGS = false;
const defaultAllowedCatalogs = new Set([
  ...(ALLOW_TESTING_CATALOGS ? ['react16', 'react17', 'react18', 'react19', 'typescriptLTS'] : []),
  'shared',
]);

const catalogPolicies: Policy[] = [
  {
    pathPattern: '',
    allowedCatalogs: new Set(['packages', ...defaultAllowedCatalogs]),
  },
  {
    pathPattern: 'packages/*',
    allowedCatalogs: new Set(['packages', ...defaultAllowedCatalogs]),
  },
  {
    pathPattern: 'demos/*',
    allowedCatalogs: new Set(['demos', ...defaultAllowedCatalogs]),
  },
  {
    pathPattern: 'docs-website',
    allowedCatalogs: new Set(['packages', ...defaultAllowedCatalogs]),
  },
];

// Expand/augment each catalogPolicies entry with the exact package.json files it applies to
function collectCatalogPoliciesWithFiles(rootDir: string): PolicyWithFiles[] {
  return catalogPolicies.map((policy) => ({
    ...policy,
    files: globSync(path.posix.join(policy.pathPattern, 'package.json'), {
      cwd: rootDir,
      nodir: true,
    })
      .map((packageJsonPath) => packageJsonPath.replaceAll(path.sep, '/'))
      .sort(),
  }));
}

function findCatalogIssues(
  relativePath: string,
  pkg: PackageManifest,
  allowedCatalogs: Set<string>,
): string[] {
  const issues: string[] = [];

  for (const field of DEPENDENCY_FIELD_NAMES) {
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
  const catalogPoliciesWithFiles = collectCatalogPoliciesWithFiles(rootDir);
  const issues: string[] = [];
  let checkedFileCount = 0;

  for (const policy of catalogPoliciesWithFiles) {
    for (const relativePath of policy.files) {
      checkedFileCount += 1;
      const absolutePath = path.join(rootDir, relativePath);
      const json = readFileSync(absolutePath, 'utf8');
      const pkg = JSON.parse(json) as PackageManifest;
      issues.push(...findCatalogIssues(relativePath, pkg, policy.allowedCatalogs));
    }
  }

  if (issues.length > 0) {
    console.error('Catalog policy violations found:');
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Catalog policy check passed (${checkedFileCount} package.json files checked).`);
}

main();
