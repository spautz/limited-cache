#!/usr/bin/env node
/* eslint-env node */
/* eslint-ignore @typescript-eslint/* */
// @ts-ignore

const path = require('path');
const fsExtra = require('fs-extra');

// All paths are relative to the root
const baseDir = path.join(__dirname, '..');
const buildDir = path.join(baseDir, 'build/');

const additionalFilesToCopy = ['LICENSE', 'README.md'];
const packageJsonKeysToRemove = [
  'private',
  'scripts',
  'devDependencies',
  'jest',
  'lint-staged',
  'husky',
];

async function copyFileToBuild(fileName) {
  const oldPath = path.resolve(baseDir, fileName);
  const newPath = path.resolve(buildDir, fileName);

  await fsExtra.copy(oldPath, newPath);

  console.log(`Copied ${oldPath} to ${newPath}`);
}

async function createBuildPackageJson() {
  const packageJson = require(path.resolve(baseDir, 'package.json'));
  const newPath = path.resolve(buildDir, 'package.json');

  packageJsonKeysToRemove.forEach((key) => {
    delete packageJson[key];
  });

  await fsExtra.writeFile(newPath, JSON.stringify(packageJson, null, 2), 'utf8');

  console.log(`Created package.json in ${newPath}`);
}

async function run() {
  await createBuildPackageJson();
  await additionalFilesToCopy.map(copyFileToBuild);
}

run();
