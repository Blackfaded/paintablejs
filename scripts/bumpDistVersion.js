const fs = require('fs');
const mainPackageJson = require('../package.json');

const distPackageJson = require('../packages/dist/package.json');

distPackageJson.version = mainPackageJson.version;

fs.writeFileSync(
  './packages/dist/package.json',
  JSON.stringify(distPackageJson, null, 2)
);
