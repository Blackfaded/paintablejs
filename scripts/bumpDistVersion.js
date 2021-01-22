const fs = require('fs');
const globby = require('globby');
const mainPackageJson = require('../package.json');

const distPackageJson = require('../packages/dist/package.json');

distPackageJson.version = mainPackageJson.version;

// bump all dependency versions in workspaces
globby([
  'packages/**/*/package.json',
  '!**/*/node_modules/**/*/package.json',
]).then((paths) => {
  for (const path of paths) {
    const packageJsonFile = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (
      packageJsonFile.dependencies &&
      packageJsonFile.dependencies.paintablejs
    ) {
      packageJsonFile.dependencies.paintablejs = mainPackageJson.version;
      fs.writeFileSync(path, JSON.stringify(packageJsonFile, null, 2));
    }
  }
});

// bump dist version
fs.writeFileSync(
  './packages/dist/package.json',
  JSON.stringify(distPackageJson, null, 2)
);
