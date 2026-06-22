#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

/**
 * `pnpm pack` leaves the tarball in the current package directory, so look for it there.
 */
async function findPackedTarball(directory: string): Promise<string> {
  const tarballs = (await readdir(directory, { withFileTypes: true })).filter(
    (entry) => entry.isFile() && entry.name.endsWith('.tgz'),
  );

  if (!tarballs[0]) {
    throw new Error('No packed tarball was found in the current directory.');
  }
  if (tarballs.length > 1) {
    throw new Error(
      `Expected exactly one packed tarball, found ${tarballs.length}: ${tarballs
        .map((entry) => entry.name)
        .join(', ')}`,
    );
  }

  return path.resolve(directory, tarballs[0].name);
}

/**
 * We run ATTW through its CLI's entrypoint, since it's not available as a plain vanilla package
 */
async function resolveAttwCliPath(): Promise<string> {
  const packageJsonPath = require.resolve('@arethetypeswrong/cli/package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as {
    bin?: { attw?: string };
  };

  const relativeBinPath = packageJson.bin?.attw;
  if (!relativeBinPath) {
    throw new Error('Failed to resolve the ATTW CLI entrypoint.');
  }

  return path.resolve(path.dirname(packageJsonPath), relativeBinPath);
}

/**
 * Run ATTW directly with Node so the script does not care which shell the user prefers.
 */
async function runAttw(tarball: string): Promise<number> {
  const attwCliPath = await resolveAttwCliPath();

  return await new Promise<number>((resolve, reject) => {
    const child = spawn(process.execPath, [attwCliPath, tarball], {
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code: number | null) => {
      resolve(code ?? 1);
    });
  });
}

/**
 * When a tarball path is provided, verify that. Otherwise, look for exactly one tarball in cwd.
 */
async function main(): Promise<void> {
  const tarballs =
    process.argv.length > 2
      ? process.argv.slice(2).map((input) => path.resolve(process.cwd(), input))
      : [
          await findPackedTarball(process.cwd()).catch((error: unknown) => {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to find packed tarball.';
            process.stderr.write(`${errorMessage}\n`);
            process.exit(1);
          }),
        ];

  for (const tarball of tarballs) {
    process.exitCode = await runAttw(tarball);
    if (process.exitCode) {
      return;
    }
  }
}

await main();
