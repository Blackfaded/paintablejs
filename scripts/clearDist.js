const globby = require('globby');
const rimraf = require('rimraf');

globby(
  [
    'packages/dist/**/*',
    '!packages/dist/react',
    'packages/dist/react/**/*',
    '!packages/dist/vue',
    'packages/dist/vue/**/*',
    '!packages/dist/**/package.json',
  ],
  {
    onlyFiles: false,
  }
).then((paths) => {
  // console.log(paths);
  paths.map((item) => {
    rimraf.sync(item);
  });
});
