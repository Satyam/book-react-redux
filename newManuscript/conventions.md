# Conventions

## OctoCats

Within the book we will use the *OctoCat* icon [(:octocat:)](https://github.com/Satyam/book-react-redux) to refer to code located in GitHub.  The OctoCat is GitHub's mascot. It usually points to large stretches of code that aren't worth including along the text, but that can be looked at, if so desired.

Most of the code boxes within this book (the ones with a thick silver frame) are extracted automatically from GitHub and the original can be reached by clicking on the OctoCat icon in the frame. For example:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/notFound.jsx#L3-L8)

## Predefined Constants

The code contains constant literals written in upper case characters, for example, `REST_API_PATH`. These are replaced by actual values during bundling, thus, `REST_API_PATH` will show as `("/data/v2")` in the packaged bundles.

## Virtual import paths

The path to some of the imported modules start with an underscore, for example, `import routes from '_components/routes';`.  These are virtual paths that WebPack will resolve to actual locations based on the aliases set in the configuration file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/webpack.config/common.js#L16-L22).  Since an actual NPM module name cannot start with an underscore, there is no risk of name collision.  These virtual routes allow us to avoid relative references to modules starting with double dot `from '../../etc'` which are hard to follow or maintain should files be moved relative to one another.  With full paths starting from these virtual roots, any reference to a moved file can be easily located and replaced.

## Omitting extensions

We omit the `.js` or `.jsx` extensions on references to imported files.  This serves several purposes.  The importer should not care whether the file does contain JSX code or not.  Should the contents of the file change to include some JSX syntax and, following convention, the file extension changed to `.jsx`, the files that import it don't need to be changed. Also, if the source file gets too large and it needs to be broken up, it can easily be done without affecting the files that import it.  For example, if the file `whatever.js` which we import with `import whatever from './whatever'` needs to be split into various files, we can move `whatever.js` to a new folder as `whatever/index.js` and all the imports will still work.  Then, the `whatever/index.js` file can be broken into several files, all within that folder, without polluting the parent folder, as long as the exports remain within `index.js` or are re-exported from it.

## Promises

We use Promises extensively, to the point of converting some Node.js library functions from using the callback convention into a Promise. We have mostly used [denodeify](https://www.npmjs.com/package/denodeify) to do that so that this code:

```js
import fs from 'fs';

fs.readFile('./foo.txt', 'utf8', (err, data) => {
  if (err) throw err;
  // do something with data
})
```

Turns into this:

```js
import fs from 'fs';
import denodeify from 'denodeify';

const readFile = denodeify(fs.readFile);

readFile('./foo.txt', 'utf8')
.then(data => {
  // do something with data
});
```

The latter seems a more expensive proposition but it must be considered that when several asynchronous operations are chained together, it is very easy to fall into the depths of indentation hell, with each successive operation called within the callback of the previous one while with Promises all the chain is nicely aligned and clearly visible, which helps with future maintenance.  It also allows for several operations to be launched at once via `Promise.all`.
