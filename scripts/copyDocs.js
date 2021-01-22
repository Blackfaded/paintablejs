const fs = require('fs');
const path = require('path');

const docsPath = path.join(__dirname, '..', 'docs');
const docFileNames = fs.readdirSync(docsPath);

docFileNames.map((item) => {
  fs.copyFileSync(
    path.join(docsPath, item),
    path.join(__dirname, '..', 'packages', 'dist', item)
  );
});
