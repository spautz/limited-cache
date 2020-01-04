#!/usr/bin/env node
/* eslint-env node */
/* eslint-ignore @typescript-eslint/* */
// @ts-ignore

const path = require('path');
const fsExtra = require('fs-extra');

// All paths are relative to the root
const baseDir = path.join(__dirname, '..');
const buildDir = path.join(baseDir, 'dist/');

async function createBuildPackageJson() {
  const packageJson = require(path.resolve(baseDir, 'package.json'));
  const newPath = path.resolve(buildDir, 'package.json');
  const packageJsonKeysToRemove = [
    'private',
    'scripts',
    'devDependencies',
    'jest',
    'lint-staged',
    'husky',
  ];

  packageJsonKeysToRemove.forEach((key) => {
    delete packageJson[key];
  });

  console.log(`Creating package.json in ${newPath}`);
  await fsExtra.writeFile(newPath, JSON.stringify(packageJson, null, 2), 'utf8');
}

async function copyTemplateDirToBuild() {
  const templateDir = path.join(__dirname, 'dist-template/');
  console.log(`Copying ${templateDir} to ${buildDir}`);

  await fsExtra.copy(templateDir, buildDir);
}

async function copyFileToBuild(fileName) {
  const oldPath = path.resolve(baseDir, fileName);
  const newPath = path.resolve(buildDir, fileName);

  console.log(`Copying ${oldPath} to ${newPath}`);
  await fsExtra.copy(oldPath, newPath);
}

async function run() {
  await createBuildPackageJson();
  await copyTemplateDirToBuild();
  await ['LICENSE', 'README.md'].map(copyFileToBuild);
}

run();
