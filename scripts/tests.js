const path = require('path');
const root = process.cwd();
const pathTo = folder => path.join(root, folder);
const denodeify = require('denodeify');
const webpack = denodeify(require('webpack'));
const mkdirp = denodeify(require('mkdirp'));
const rmdir = denodeify(require('rmdir'));
const readdir = denodeify(require('recursive-readdir'));
const exec = denodeify(require('child_process').exec, (err, stdout, stderr) => [err, stdout, stderr]);

const Mocha = require('mocha');
const mocha = new Mocha();

const testDir = pathTo('test');
const tmpDir = pathTo('tmp');
const testUtils = pathTo('test/utils/*');

// This adds source line numbers to error reports
mocha.suite.addTest(new Mocha.Test('Enabling source code line mapping', () =>
  require('source-map-support').install({
    environment: 'node'
  })
));

const wpConfig = require(pathTo('webpack.test.config.js'));

rmdir(tmpDir)
  .then(() => mkdirp(tmpDir))
  .then(() =>
    readdir(
      testDir, [testUtils, '!*.js']
    )
    .then(files =>
      Promise.all(files.map(file => {
        const outDir = path.dirname(file).replace(testDir, tmpDir);
        const fileName = path.basename(file);
        return mkdirp(outDir)
          .then(() =>
            webpack(Object.assign({},
              wpConfig, {
                entry: file,
                output: {
                  path: outDir,
                  filename: fileName
                }
              }))
            .then(stats => {
              if (stats.hasErrors()) {
                console.error('---', file, stats.toString('errors-only'));
                throw new Error('compilation error');
              }
            })
            .then(() => mocha.addFile(path.join(outDir, fileName)))
          );
      }))
      .then(() => {
        if (process.argv.indexOf('--coverage') > -1) {
          return exec(
            'istanbul cover _mocha -- --recursive ./tmp',
            {
              env: process.env,
              cwd: root,
              encoding: 'utf8'
            }
          ).then(console.log);
        }
        mocha.run(failures => console.log(`${failures} failure(s)`));
      })
    )
  ).catch(console.error);
