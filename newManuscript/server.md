# The Web Server code

We start by following the standard recipe to create an instance of an Express web server using Node.js native HTTP server:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L15-L16)

We used `app` as a variable name simply because it is customary to do so.  All Express documentation uses `app` for the express server instance, `req` for the incoming requests and `res` for the responses to it.  Trying to be original might lead to confusion so it is best to stick with what is common practice.

We convert the server functions we will use into Promises by *denodeifying* them:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L18-L19)

Using `denodeify` with functions, as we did with `fs.readFile` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L13) is straightforward.  When using it on method of an object instance, we have to denodeify the function reference bound to that instance, so the method has a valid `this` when invoked.

The same server will both provide regular HTML, style sheets, images, icons or whatever clients request but it will also manipulate data via a REST API.  In a large installation, handling data might be delegated to other set of servers, while a further set of servers might actually run the database management system.  We are doing it all from the same server.  We are, though, creating a separate router to handle the REST API requests:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L21-L22)

On importing Express [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L3) we renamed `express.Router` as `createRouter` which, when called, returns a new router.  `dataRouter` will handle all the routes that start with the `REST_API_PATH` path which is a constant that via some WebPack magic which we'll see later, comes from `package.json`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/package.json#L17-L21)

We will use those other `host` and `port` constants elsewhere as `HOST` and `PORT`. We usually try to respect the customary naming conventions for each type of file, that is why we use `host` in the `package.json` file and `HOST` in the JavaScript code, but that is a matter of preference.

Thus `dataRouter` handles the paths starting with `/data/v2`.  Since the data will expected to be in JSON format, before letting it reach `dataRouter`, we pass it through `bodyParser.json()`.

> It is somewhat obvious why the `/data` part of the route, after all it is meant to manipulate simple data.  It might not be so obvious why the `/v2`.  Over time, the API may change in incompatible ways, however, during the transition time, both versions will be required to coexist.  We could actually have a `dataRouterV2` and an older `dataRouterV1` running from the same server responding to different APIs.  We control what is running on the server, but we cannot fully control what is installed or cached in the client system so it is always a good idea to tag the API with, at least, the major version number.

Express checks the paths of the URLs requested against the routes in the order in which they are set in the configuration via `app.use`, `app.get` or any of the other `app.`*method* methods.  That is why the routes that branch off the *natural* path go before the *catch-all* ones, the exceptions before the generic ones.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L24-L25)

The `express.static` handler checks the file system for requested resources.  Combined with Express routing it also helps to translate public, external paths to local paths.  In this case, we translate any path starting with `/bootstrap` to `node_modules/bootstrap/dist` relative to the application path.  The `absPath` function, defined elsewhere [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L12), uses `path.join` to assemble a full path from the app root and the given relative path.  Bootstrap is installed in our server since it is listed as a dependency in `package.json` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/package.json#L41).  Translating the path here saves us from moving over the files to another public location in the server. It is handy for this book and it also shows a nice feature of Express, however, it might not be efficient in actual production.

Using `express.static` with no route, basically means *"for everything else, check here2*, in this case, the `/public` folder in our setup.  Thus, for any route not starting with either `/data` or `/bootstrap` it will try looking for a file in `/public`, which includes `/public/bundles` where the code and CSS files for this application reside.

This catch-all route would seem the end of the road for our routes. However, if the file is not found in `/public` then the `express.static` will not send a `404 Not found` error, instead, it will signal the router to keep looking for further paths, only when no further routes are available the router will send the 404 error.

## Isomorphism

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L27)

This line sets up isomorphism on the server side.  The `isomorphic` *middleware* is imported [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L8) from our own code. In Express parlance, *middleware* is code that stands in the middle of the process of handling a request.  Both `bodyParser` and `express.static` are middleware, they do their thing, parsing JSON or trying to deliver the contents of a file, and then let Express carry on with the request or, depending on the middleware, handle it by themselves.  `body.parser` always lets requests pass through, `express.static`, on the other hand, if it finds the file requested, it responds to the request by itself.

Our isomorphic middleware, which we will look at in a later chapter, does something similar.  It checks whether the path matches any of the routes it is configured to handle and, if so, it deals with the request by itself, otherwise, it lets it pass through.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L29)

When it does pass through, it falls into the line above. For any `GET` request that might remain, the server will send the default `index.html` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/index.html).

It is easy to see the difference in using isomorphism or not.  By simply deleting or commenting out the line about using the `isomorphic` middleware, (and rebuilding the app), the application will still work. From the user point of view, though, the browser will flash.  The screen will be initially blank, then once the client code executes, it will render a blank page while the data for the initial page is requested. Finally, when the data does arrive, the page will be re-rendered with the data.  Since we are using `sql.js` for our database server, which is quite slow, the delay is noticeable, specially in the first load before anything gets cached.  If we open the developer tools in the Network tab we can see that without isomorphism we have an extra request, the one for the data.

With isomorphism active, a copy of the page with all its data is sent as static HTML.  There is no flash at all. The page is rendered even before the code starts executing.  When the code does execute and React is about to render it, it checks the static image that was sent from the server and, if it matches what it would render, it just lets that page be. Actually, the server sends a checksum made from the generated content as a data attribute in the static page. React just needs to check this checksum against the one it would generate itself.

Though the application, as set up, works with the isomorphic middleware dropped, the client-side code will issue a warning and the tests will also produce an error because it expects isomorphism.  Fully dropping isomorphism does require a few changes elsewhere.

## Start and Stop

This server module does not start on its own,  instead it exports `start` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L31-L40) and `stop` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L41-L44) functions.  The reason for this is that other code might want to control it so we don't want to just let it start on its own.  One such code is the test suite.  The tests cannot see the `Server running at ....` message.  It has to be able to start the server and know when it is ready to be tested.  That is also why both exported functions return Promises.

### Starting

The `start` function sets up the database server:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L31-L34)

We are using SQL.js, which is not recommended for a production setting, so the code presented here should not be used in such environment.

First we create an instance of an empty, memory based database.  We assign this database instance to `global.db` so that it is accessible as `db` anywhere else in the whole application.  To prevent ESLint complaining about our use of this `db` global variable, we have set its configuration file to accept it as a global, along the other WebPack generated constant literals [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/.eslintrc.json#L15-L22).

Connecting to an actual production-grade database engine will usually be an asynchronous operation.  If the selected database driver does not already return a Promise, it will have some means to signal its readiness.  For example, when connecting with the [MySqL driver](https://www.npmjs.com/package/mysql#establishing-connections) we might use `denodeify` to turn it into a Promise:

```js
var mysql      = require('mysql');
global.connection = mysql.createConnection({
  host     : 'example.org',
  user     : 'bob',
  password : 'secret'
});

const connect = denodeify(connection.connect.bind(connection));
const disconnect = denodeify(connection.end.bind(connection));

// later on, in start
connect().then( /* .... */ );
// and in stop
disconnect().then( /* .... */ );
```

Back to our SQL.js database, we have an empty database right now so we read the  SQL statements that will create the tables and fill them with data [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/data.sql) and then execute the whole set of statements at once.

#### Data handlers

An application server might have to handle different sets of data for various parts of the client application. We will call them data handlers.  We only have one such data handler, `projects`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L10).

Don't bother looking for a `server/projects.js` file.  We have pretended our sample data handler to be more complex than it actually is so we broke it into several source files and placed them under the `server/projects` folder [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/master/server/projects) and, within it, we have an `index.js` which is what actually gets imported.

Once the database connection is established and before we allow the web server to start accepting requests, we initialize each of those data set handlers. We will assume that such initialization might be asynchronous and that each will be independent of any other thus we use `Promise.all` to start them all at once. The chain of promises will only continue when all of them succeed or any of them fails.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L35-L37)

In our simple example application, we only have one set of data for a projects/tasks application.  In a real-life app, the argument to `Promise.all` would contain a larger array of initializers.

Each data handler will resolve to an Express router instance. In the `then` part, we tell `dataRouter` to use that router instance when the path starts with `/projects`.  `dataRouter` itself is called on routes starting with `/data/v2` so our `projects` data handler will respond to `/data/v2/projects`. All requests received by `dataRouter` have already passed through the JSON `bodyParser`.

#### Start listening

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L38)

To finish up our initialization, we finally set the server to `listen` for requests, using our *denodeified* version of `server.listen`.

> Promises and fat arrows go well with one another.  If the body of a fat arrow function is a simple expression, not a code block, its value will be returned. Using fat arrow functions in the `then` parts of a Promise produces terse code. If the body of a fat arrow function is a Promise, it will return it, leaving the enclosing Promise in a *pending* state.  If it is a value, it will *fulfill* it with that value.

### Stopping

Stopping the web server is trivial in our case since the database is an in-memory one, and we have no other resources to disconnect from. Should there be any, such as the MySQL example above, this is the place to do it.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L40-L42)

As it is, we simply close the connection using the denodeified version of `server.close`.  We might have simply exported the `close` function, but in a real app, there will be more things to attend to when closing so we opted to make the `stop` function a placeholder for them, though right now it holds just one simple function call.

## The CLI

To actually start and stop the server from the command line, we have `index.js`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/index.js)

The server is started by calling the `start` method imported from `server.js`, then we show a message to the operator and make sure to catch any errors in the startup.  The code in `server.js` had no error-catching because what we do with an error varies in between one environment and another so it is best left to the calling module.

The `shutdown` function calls the `stop` method, shows a message and finally exits.  It is called from listeners for the OS signals for program termination. This ensures everything gets cleaned up, connections to database managers and whatever other resource we might be using.
