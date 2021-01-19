const path = require('path');
const fse = require('fs-extra');

const src = path.join('./templates/package.json');
const dist = path.join('../../dist/package.json');

fse.copySync(src, dist);
