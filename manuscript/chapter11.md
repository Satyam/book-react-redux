# Modules, Imports and Exports

Only recently, with ECMAScript-2015 has JavaScript has built-in support for modules, at least in its syntax since no platform actually knows what to do with it.  Babel helpfully transpiles `import x from 'myModule'` into `const x = require('myModule')` which NodeJS understands but no browser would.

The only mechanism to load external modules into a browser is via the `<script>` tag which is far from perfect.  The biggest issue is that whatever gets loaded goes into the same global namespace as everything else. If we had complete control of what goes into the browser we could be careful of what gets loaded and avoid any name collisions, however, with applications getting ever more complex, this is hard. What if we are using [Lodash](https://lodash.com/) and some widget loads [Underscore](http://underscorejs.org/) both of which load as `window._` in the browser? The one that loads last would end up overwriting the other and, though they are more or less compatible, Lodash is a superset of Underscore and whatever incompatibility there might be in between them might ruin our application.

The beauty of the way NodeJS modules load, is that when we `require` a certain module, we tell it where we want it, both in name and scope; we say `const axios = require('axios');` because we want it to be called `axios` in whichever scope that `axios` variable is being declared and, if we wanted it called something else, we could do, say, `const http = require('axios');`.  In browser-land, we don't have that option, we load Axios via `<script>` and it goes into `window.axios`, we have no control of name (axios) or scope (global).

This prevents the development of modular applications.  In our server script, we broke our simple app into several source files which *require*d one another each keeping its internals well hidden from each other exposing only what each explicitly exported.  Over time, several mechanisms to fix this were developed and nowadays, two module packagers are at the top, [Browserify](http://browserify.org/) and [WebPack](http://webpack.github.io/).

Inadvertently, we have been using WebPack all along. Remember earlier on that we mentioned there were different versions of Axios, one for NodeJS (which we used for our tests) and the browser version?  Our `node_modules/axios` folder contains two different folders, `dist` for the browser version and `lib` for the NodeJS version.  Looking at the first few lines in the code for the [browser version](https://github.com/mzabriskie/axios/blob/master/dist/axios.js) we can see it starts with `(function webpackUniversalModuleDefinition(root, factory) {` and later on we find a lot of lines preceded with `/******/`.  All those are added by WebPack. The Axios version on `/lib` is the original, non-packed version and we can see that the same code from [/lib/axios.js](https://github.com/mzabriskie/axios/blob/master/lib/axios.js#L1)   starts about line 60 something in [`/dist/axios.js`](https://github.com/mzabriskie/axios/blob/master/dist/axios.js#L64) after all the WebPack packaging handling stuff.

## WebPack

To install WebPack, we do as we've been doing so far:

```
npm i --save-dev webpack
```

We can change our code to use `require` just as we've done in the server-side code:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-01/client/index.js)

Which means we no longer need to load Axios separately in `index.html` since our web-packaged code will already contain it. The earlier `<script src="/node_modules/axios/dist/axios.js"></script>` is now gone:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-01/public/index.html)

In `.eslintrc.json` we can now drop declaring `axios` as a global variable, leaving only the *environment* declaration:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-01/client/.eslintrc.json)

We can change our earlier `build` script in `package.json` to use WebPack:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-01/package.json#L11)

So if we now do `npm run build` we will have our code packaged with Axios. If we look into the resulting files in `/public/lib` we can recognize our code right after the WebPack un-packager and then the code for Axios.

We can now run this as we did before, we type `npm start` to launch our server and go to `http://localhost:8080` in our browser and the app will most likely work if we have an updated browser.  One problem now is that WebPack has packed our code, but has not transpiled it so it still has the ES2015 features.  If we try to run it in an older browser, it will fail.

## Packaging and Transpiling

WebPack can use what it calls *loaders*, utilities that process the code before it gets packed.  Babel has such a loader for WebPack, which we can use:

```
npm install --save-dev babel-loader babel-core
```

We already have `babel-preset-es2015` installed along `babel-cli`, otherwise, we should have installed it as well.

To tell WebPack what loaders it should use, we add a configuration file which, by default, is called `webpack.config.js`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-02/webpack.config.js)

Here, we are telling WebPack that for files whose filename match the given regular expression (in this case, they end with `.js` or `.jsx`), unless they are under `node_modules` or `bower_components`, it should use `babel` (the `-loader` suffix is assumed). The `.jsx` extension is for React files, which we will use later on. [Bower](http://bower.io/) is another package manager like NPM which we are not using.  We don't want Babel to waste time trying to transpile code from NPM or Bower libraries because they should already be compatible with old-style JavaScript.

We also need to configure Babel. Earlier on, we did it via an option in the NPM script:

```
babel client --presets es2015 --out-dir public/lib
```

We can also configure Babel via a configuration file called `.babelrc`:

[(:memo:json)](https://github.com/Satyam/book-react-redux/blob/chapter-11-02/.babelrc)

After all this, if we do `npm run build`, we will get both JS files both transpiled and packed.

That means we will no longer be using Babel standalone so we might as well drop `babel-cli`:

```
npm uninstall --save-dev babel-cli
```

Now, we should make some numbers, the resulting `index.js` is 32.2kB in size, `project.js` is 32.4kB.  Most of that is due to Axios and a little bit comes from WebPack which is exactly the same for both.  The difference is in the pre-packaged sources, `/client/index.js` which is 341 bytes long while `/client/project.js` is 594 bytes long.

This might seem an extreme situation because we are doing so little in our code, but it is not that different from a real application.  We are using just two common libraries, Axios and WebPack.  In larger applications we would have more such common utilities, for example, standard UI components such as calendars, tabbed interfaces, menus and what not.

We are forcing our web pages to load two scripts which are basically the same.  We can take a look at those two files side by side (using GNU `diff` or some such) and we will see there is very little difference in between them.

## Almost a Single Page Application

We can pack both our client scripts into the same bundle with Axios and WebPack and have our client do just one load. Once the script is in the browser's cache, all pages would benefit from that single download.

To do that, we must first convert our two separate scripts to loadable modules and to do that we have to export something.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-03/client/index.js)

We export a function that, when called, will execute mostly the very same code we had so far.  To avoid repetition, the function receives the DOM element that is to receive the content.  We do the same for `project.html`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-03/client/project.js)

Now we have to glue them together which will decide, based on the URL of the page requested, which content to use. Its function is not dissimilar to that of the routers we have been using on the server side so we call it `router.js`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-03/client/router.js)

We require both modules then, depending on the path of the URL requested, we execute one or the other.  The path might be either '/' or `/index.html` for the default page or `/project.html`.  If it doesn't match any of the regular expressions for them, we simply show a message. The later should never happen since this script would be loaded by either of those HTML pages.

Now, instead of building two separate packages, we build just one which includes both options.  We can do that by using the WebPack configuration file:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-03/webpack.config.js)

We are telling WebPack that the entry point for our app is `/client/router.js` and our packaged file should be called `bundle.js` and will go into `/public/lib`.  WebPack loads the file that is the entry point, parses it and locates all its calls to the `request` function, then loads and parses those looking for their `require`s and so on until it packages all of the dependencies into `bundle.js`.

The build script in `package.json` is now far simpler since all the information is now in the configuration file:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-03/package.json#L11)

We also need to change both `index.html` and `project.html` because instead of each loading its own separate JavaScript file, they both load `bundle.js` which, with the router and all, has grown to 33.9kB:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-03/public/index.html)

The `/public/lib` folder might still contain `index.js` and `project.js` files from previous compilations. We may delete those since they are no longer used.

Not surprisingly, both HTML files are exactly the same, their content determined by the single JavaScript file `bundle.js` which decides what to show.  Unfortunately, the browser doesn't actually know the two files are alike, since each comes from a different URL it will load each HTML file separately.  We still need the two files because the user might enter either of the two URLs, unless we fix that in the router.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-04/server/index.js#L20-L23)

The routing functions of Express can take regular expressions instead of strings. We use that ability to tell Express that if the user requests `/`, `/index.html` or `/project.html`, it should return the very same `index.html` file.  We can now delete `/public/project.html`.

Now it really starts to look like a Single Page Application.  We have a single `index.html` and a single `bundle.js` to serve both requests.  However, whenever the user navigates from one page to the other, those requests will still go all the way to the server.  Browsers keep copies of what they load in their caches so, most likely, it will load the cached copy, however, it will still do a quick check with the server to make sure those files are still valid.

It would be good to be able to tell the browser to load it only once and avoid bothering the server with these requests.

It would also be nice to have a more capable router than our improvised `router.js` is.

Fortunately, there is already software to do both things, client-side routing software can handle routes pretty much as Express does and will capture navigation requests and prevent them from generating unnecessary traffic.

## Summary

We've seen how we can benefit from the same module-loading capability of NodeJS in the browser by using a bundler such as WebPack or Browserify.

By using a primitive router, we have managed to put our two earlier JS files into a single bundle and by configuring our server, we can deliver our application using only one set of files.
