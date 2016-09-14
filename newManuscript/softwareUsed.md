# Software used

Our sample application will use JavaScript extensively both for the client and the server.  We used JavaScript even for auxiliary scripts, no Bash shell or Python, all plain JavaScript.

On the client side, our application will use React along several related packages such as React-Router and Redux for data manipulation.  We will use the new standard global [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch) method which is already available in several browsers and can be emulated via suitable polyfills if not natively available. Its usage is concentrated on just a couple of files so it should be easy to swap it out for some other communication package.

We are using Twitter's [Bootstrap](http://getbootstrap.com/) for its CSS styles, fonts and icons, though we are not using any of its active components.  We haven't used any active components from any library because that simply requires following the recipe for whichever library and doesn't need much explaining.  We have made all of our components so as to learn how to do them.

On the server side we are using [Express](http://expressjs.com/), possibly the most popular web server framework for Node.js. There are several other similar packages available, but this book is not about what's on the server but on the client, thus, we've made a conservative choice in this area.  Express is well-known and even those who might prefer other web servers will have dabbled with Express at some point so it will be somewhat familiar.  Since our application will be isomorphic, being able to run JavaScript in the server is a must.

We have used the most basic SQL database manager we could find, [SQL.js](https://www.npmjs.com/package/sql.js) a pure JavaScript version of [SQLite](www.sqlite.org). The concepts explained in this book are not tied to whatever data storage might be in the background so we didn't try to use anything more sophisticated. We are not advocating for any particular data storage solution and certainly not SQL.js which is quite primitive and terribly slow in a production environment, but it is very simple to install by just doing an NPM install with no need for any further setup or configuration.  For the purpose of this book it takes a lot of administrative trivia out of the way and does not polute the reader's machine.  

Incidentally, we are not installing anything globally, except for Node.js and a browser, both of which we would expect are already there. We are not using the `-g` option of the `npm install` command.  Once done with the sample code, uninstalling it is just a matter of removing the installation folder.

We are using EcmaScript-2015 or ES6 syntax for most of the code and Babel to transpile it to ES5.  We are not using ES6 for code that is not transpiled, such as ancillary scripts and the WebPack configuration files, except for some ES6 features already available in Node.js 4.4.7, the current recommended stable version.

We are using [WebPack](http://webpack.github.io/) to pack our modules into bundles that a browser can load. However, since we are using ES6 syntax not yet supported by Node.js and a few other WebPack features that turn out to be quite handy, we are using WebPack to create server-side bundles as well. This is partly due to implementing isomorphism, which requires the server to be able to run the very same code that the client does so as to create the static image that the browser will download.  So, it is easier if both sides use exactly the same environment.

Finally, we are using the [ESLint](http://eslint.org/) linter with the [Airbnb](https://www.npmjs.com/package/eslint-config-airbnb) rules set and [Mocha](https://mochajs.org/) with `expect` assertions from [Chai](http://chaijs.com/api/bdd/) for testing.  

There are plenty of other modules used here and there, but these are the main dependencies that most influence the code.

Something sorely lacking in this app are API docs. Unfortunately, none of the tools reviewed work as could be desired.  Most are confused by either the JSX syntax used by React or don't support ES6 syntax or have no means to describe modules or document their exports.  In the end, the resulting docs were of very little help so no effort was put into adding doc-comments to the code.
