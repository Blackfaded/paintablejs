const globby = require('globby');
const rimraf = require('rimraf');

globby(
  [
    'packages/dist/**/*',
    '!packages/dist/core',
    'packages/dist/core/**/*',
    '!packages/dist/react',
    'packages/dist/react/**/*',
    '!packages/dist/vue',
    'packages/dist/vue/**/*',
    '!packages/dist/vue3',
    'packages/dist/vue3/**/*',
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
