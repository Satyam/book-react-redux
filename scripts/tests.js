const path = require('path');
const denodeify = require('denodeify');
const webpack = denodeify(require('webpack'));
const mkdirp = denodeify(require('mkdirp'));
const rmdir = denodeify(require('rmdir'));
const readdir = denodeify(require('recursive-readdir'));
const Mocha = require('mocha');
const sourceMapSupport = require('source-map-support');

const args = require('commander');

args
  .version('0.0.1')
  .description('Runs a batery of tests after webpacking them. If not specified, runs all .js files found in ./test')
  .usage('[options] [files to test]')
  .option('-c, --coverage', 'Run Istanbul for code coverage')
  .parse(process.argv);

const testFiles = args.args;

const root = process.cwd();
const absPath = folder => path.join(root, folder);

const mocha = new Mocha();
const exec = denodeify(
  require('child_process').exec,
  (err, stdout, stderr) => [err, stdout, stderr]
);

const testDir = absPath('test');
const tmpDir = absPath('tmp');
const testUtils = absPath('test/utils/*');

// This adds source line numbers to error reports
mocha.suite.addTest(new Mocha.Test('Enabling source code line mapping', () =>
  sourceMapSupport.install({
    environment: 'node',
  })
));

const wpConfig = require(absPath('webpack.config/test.js'));

rmdir(tmpDir)
  .then(() => mkdirp(tmpDir))
  .then(() => (
    testFiles.length
    ? testFiles.map(absPath)
    : readdir(
      testDir, [testUtils, '!*.js']
    )
  ))
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
                filename: fileName,
              },
            }
          ))
        )
        .then(stats => {
          if (stats.hasErrors()) {
            console.error('---', file, stats.toString('errors-only'));
            throw new Error('compilation error');
          }
        })
        .then(() => mocha.addFile(path.join(outDir, fileName)));
    }))
  )
  .then(() => {
    if (args.coverage) {
      return exec(
        'istanbul cover _mocha -- --recursive ./tmp',
        {
          env: process.env,
          cwd: root,
          encoding: 'utf8',
        }
      ).then(console.log);
    }
    return mocha.run(failures => console.log(`${failures} failure(s)`));
  })
  .catch(console.error);
