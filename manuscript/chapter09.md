# Separating Concerns

Our `projects.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-04/server/projects.js) file is a real mess.  It was useful so far because it allowed us to see in just one glimpse how a request could be handled but it mixed two separate concerns, those of handling the HTTP and the database connections.  As more complexity was added to the routes in some of the examples, they became really difficult to follow.

We fix this mess by separating the concerns.  To start with, it seems our server software will only deal with projects.  This is probably shortsighted, we would eventually have to tackle other concerns, such as user login, which will also require us to manage users.

Our server has already hard-coded a root route to deal with projects:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-04/server/index.js#L15-L16)

For starters, we will move the code dealing with projects into its own `projects` folder under `/server` [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/chapter-09-01/server).  This will further give us flexibility to separate the code dealing with projects into various files without crowding the `/server` folder.

The `routes.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-01/server/projects/routes.js) file deals with routing the HTTP requests to appropriate handlers and `transactions.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-01/server/projects/transactions.js) deals with actually handling the data for those requests.

Several clues indicate the split is a good thing.

* `routes.js`
  * no longer uses `db`, the global variable holding the database connection.
  * validates all incoming arguments and issues a `400 Bad request` HTTP Error.  The 4xx error codes are client-side errors and sending improper values is its concern.
  * converts incoming text values into proper internal data types (numbers and booleans)
  * sends `500 Internal Server Error` when an error comes from `transactions.js`.  The 5xx error codes are for server-side errors and whatever the specific error might be, from an HTTP standpoint, it is a 5xx error.
* `transactions.js`
  * it assumes that the data from the request is present and validated
  * it is the only one accessing the database
  * knows nothing about HTTP error codes
  * knows nothing about where the data is located within the request

All the database functionality is contained within an object which is the only export of `transactions.js`.  Each property in that object is a function. An `init` function sets everything up, basically, pre-compiling the SQL prepared statements, followed by several functions handling each possible CRUD operation.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-01/server/projects/transactions.js#L1-L32)

All the functions are asynchronous receiving a `done` callback function as their last or only argument.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-01/server/projects/transactions.js#L49)

All data handling functions, such as the two shown above expect the following arguments:

* `keys`: Object containing the key or index to locate the item to operate upon.  They are usually `pid` and/or `tid`.
* `data`: Object containing data associated to the request. They can be `name` and `descr` for projects, `descr` and `complete` for tasks.
* `options`: Object containing request options such as
  * `fields`: list of fields to return
  * `search`: name of field and value to look for in that field.
* `done`: callback function.

They all produce the same type of reply through the combination of the two arguments of the `done` callback function.  

* `done(null, data)`: success.  Requested data is returned.
* `done(err)`: error. The database handler produced some sort of error.  The second argument is irrelevant.
* `done(null, null)`: not found. The keys provided failed to locate any items.  This is usually an error and `routes.js` reports it as a `404 not found` HTTP error.  This is different from a request for a list of items that returns no items because that returns `done(null, [])` and it is not necessarily an error.

Extracting the arguments for each data processing function and processing the replies is mostly handled by the `processPrj`  function:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-01/server/projects/routes.js#L4-L10)

It receives the name of the method within `transactions.js` that should handle the operation, the `res` response object from Express and the `keys`, `data` and `options` object for each request, as described above. It calls the given method on the `transactions` objects which is the result of requiring `transactions.js`

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-01/server/projects/routes.js#L2)

On receiving the callback call, it checks for errors and sends a 500 error if one is found.  If `err` is `null` it then checks whether `data` is `null` and if so it sends a 404 error and otherwise just sends the data.

A typical database operation turns out to be quite simple:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-01/server/projects/transactions.js#L67-L74)

All operations receive the very same 4 arguments though depending on the operation, some will be empty.  Here, `getTaskByTid` calls the SQL prepared statement `selectTaskByTid` providing it with the object that will fill its placeholders, in this case only one `$tid` for the task Id.  On callback, it checks for errors and return immediately if any is found, it then checks whether a task item was actually returned and if so whether the `pid` on it matches the `pid` requested and in either case, it returns both null indicating that no record matched the requested keys.  Finally, it does a data type conversion on the `completed` field because SQLite does not have an actual  Boolean type but represents it as numbers 0 or not zero.  Just as the `routes.js` module dealt with type conversion on the data received in the HTTP request, it is the responsibility of the module dealing with the database to do the data type conversion of the values received from it to native JavaScript data types. Finally, it calls `done` with the data retrieved.

It is always a good rule that the first module receiving the information from an external source (http client, database handler, etc.) is responsible for validating and converting the values to native data types.

We will off-load dealing with specific data routes from our core web server code.  Instead of setting up a sub-router for the whole `/data/v1/projects` route [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-04/server/index.js#L15-L18), we will only deal with `/data/v1`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-01/server/index.js#L15-L16)

However, it is not a good idea to let every data server plug itself into whichever route it pleases.  It is best to have some centralized place responsible to tell each module which branch off the main `/data/v1` route it should respond to.  Thus, we tell the module  where it should go when initializing itself:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-01/server/index.js#L28-L29)

The projects router will receive the `dataRouter` and the `branch` it should respond to.  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/routes.js#L17-L21)

Each module might choose to generate a new sub-router, as we did here by creating a new `projectsRouter`, or it might use the `dataRouter` and concatenate the `branch` into each of the paths:

```js
// With sub-router
projectsRouter.get('/:pid', (req, res) => {

// Concatenating the branch into the path
dataRouter.get(`${branch}/:pid`, (req, res) => {
```

Within each router, Express checks the routes sequentially in the order they were defined.  By creating sub-routes we turn this sequential list into a tree, which is faster to traverse.  It also allows us to plug any group of routes anywhere else in the tree with little effort should we ever need it.  Besides, we write less.

It might well be noted that in our database handlers, the arguments `keys`, `data` and `options` copy values from `req.params`, `req.body` and `req.query` respectively.  It might seem that we are coupling our data-handling functions with the REST API, just changing the name of things. This is not so.

As we mentioned [earlier](#chapter08-handling-url-query-parameters), each part of the URL has a specific purpose. The path, such as `/data/v1/projects/25` is meant to identify a resource, the `25` in this case being the `pid`, thus, it matches the concept of a `key` in an indexed database or any other data-retrieval mechanism.  The data associated with that resource should go elsewhere, `req.body` in the request or the `data` argument in each data handling function.  Finally, it is equally fitting that the `options` come in the form of query parameters in `req.query`.

Thus, it is far from coincidence.  However, this is in no way enforced by Express or any of the other library modules we have been using. It is just our own convention.

## Simplifying validation with middleware

We have already seen how flexible Express can be in the way we can match routes.  We have transformed a large sequential list of routes to a tree quite easily. Routes also allows us to use variable parts in routes and extract them as parameters.

Express is also flexible in the way we handle that route once it has been matched.  So far, we have used the pattern:

```js
router.method('route pattern', (req, res) => {
  // ...
});
```

However, Express allows any number of handlers to be chained after each route pattern.

```js
router.method('route pattern', handler1, handler2, /* .... */ (req, res) => {
  // ...
});
```

This can be very useful in validating the data received.  It is obvious from our `routes.js` file how we keep repeating the very same validation code over and over again.  We can simplify this by using chained handlers which is basically what middleware does.

All route handlers have three arguments, `req` and `res` which we have been using so far and `next` which we haven't even mentioned yet.

The third, `next`, argument is a function that, when called, tells Express to call the next handler in the chain and, if there are no further handlers for that route, to go back to route matching.

Handlers can add information to both `req` and `res` and each successive handler in the chain will see the changes the previous one has made on those objects.  That is what, for example, `body-parser` does.  It reads and parses the information received in the request body and places it in `req.body`. Then, it calls `next()` so Express continues matching routes.

We have moved our validators to a separate `validators.js` file. This is our `pid` validator:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-02/server/projects/validators.js#L12-L19)

It converts the `:pid` parameter from string to number.  If it is `NaN` it means the conversion failed and sends back a 400 HTTP error. Otherwise, we store the converted `pid` into `req` in an object of our own called `$valid` under `keys`.  Finally, it calls `next` to chain into the next validator or the final handler.

The `send400` function sends our default response to invalid request data:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-02/server/projects/validators.js#L1)

When we return from sending the 400 response, we are not calling `next` because there is no point in continuing further down the chain, a response has already been sent. We only call `next` on a successful validation.

The choice of using a `req.$valid` object to store validated values is completely arbitrary.  It simply needs to be some property that doesn't collide with any existing property names.  Express does not use the `$` for its properties.  Traditionally, though variable names can start with an underscore `_` or a dollar sign `$`, they are somewhat reserved.  Identifiers starting with underscore are meant to signal a *private* member.  It doesn't meant they are really private in the sense of other languages that make them invisible to other modules, it just signals the intent to keep them private.  In other words, it signals that developers should not count on it.  A developer is expected to support the *public* interface of their modules.  If any public interface is broken, then you have a *backward compatibility* issue.  Developers are not expected to support their *private* interfaces and they signal those by using the underscore prefix.  If you use any private interface from a third party module, you do it at your own risk.

The dollar sign usually signaled temporary or auxiliary variables whose existence is ephemeral. Then came JQuery, but that is another story. So, using `$valid` under `req` should be quite safe.

Our validators all assume there is a `req.$valid` object.  To ensure that, we use another chained handler:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-02/server/projects/validators.js#L1)

We have to put this chained handler before any validators and we already have the perfect place to do so.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-02/server/projects/routes.js#L14-L16)  

Our `projectsRouter` sub-route handler is just another piece of middleware and any number of such handlers can be chained even when defining a new sub-route.  So, we add our `add$valid` middleware right in front of the sub-route handler to ensure `req.$valid` will already be available for any handler below.

This makes all our routes quite simple, even boringly so:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-02/server/projects/routes.js#L50-L54)

To PUT (change) a task, we need to validate both the `tid` (which includes validating the `pid`) and the data to change.  If each of these validators succeeds, each will call `next` until the chain falls into our own handler which calls `processPrj` with the name of the method to execute.  Note that the last handler in the chain does not call `next` because it will take care of the request itself and no further handlers need to be concerned with it.  If it did call `next`, Express would continue the route matching process and with no further handlers matching this particular route, it would go all the way until the end and then send a `404 not found` reply, which is not good, mostly because of the time wasted since the valid reply would have already been sent long before.

The `processPrj` function has not changed that much from the previous version.  Instead of expecting the `keys`, `data` and `options` arguments, it expects to find those same arguments within `req.$valid` so it uses those.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-02/server/projects/routes.js#L5-L12)

Can we go a little further?  `processPrj` receives `req` and `res` like all handlers. Can we make it a piece of middleware?
Sure!

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-03/server/projects/routes.js#L5-L12)

Lets take a look at both versions side by side.  The difference is just in the very first line:

```js
// Previous:
const processPrj = (op, req, res) => {

// Now:
const processPrj = (op) => (req, res) => {
```

We turned `processPrj` from a function that receives three arguments into a function that receives the single `op` argument and returns a function that is the actual handler that will eventually receive the `req` and `res` arguments and respond with the requested data, which is what a route handler does.  In other words, `processPrj` is now a function that returns route handlers already bound to a particular `op`. The inner function will have access to `op` in the outer function via closure.  This is called *currying*.


A route in our list of route handlers ends up quite succinct:

```js
projectsRouter.put('/:pid',
  validators.validatePid,
  validators.validatePrjData,
  processPrj('updateProject')
);
```

It is just a number of chained middleware and handlers each doing its part in the processing of the request.

Now we have much less code repetition than we had before, all our validation is concentrated each in one simple validator. Should we later change the `pid`s or `tid`s to something else instead of plain integers, for example, UUIDs such as `{3F2504E0-4F89-41D3-9A0C-0305E82C3301}` we can change it in a few places.

Our code coverage also increases.  Since there is less repetition, there are fewer repeated lines and branches that need to be separately tested with extra tests.  Now, with the same number of tests, we go through most of the code.  

Another interesting effect in our code coverage is that the column showing the number of times a certain line of code has been used increases since those fewer lines are used more times each.    

We haven't added any tests since doing SQL Injection but we certainly should, though they wouldn't add much for the purpose of this book. Please feel free to try on your own. Our validators should be thoroughly checked forcing errors and making sure they detect them. One advantage of putting our validators into a separate file is that they can be tested on their own, without having to go through Express' routing or doing actual SQL transactions.

To top this off, we will do further chaining of the JavaScript kind.  The `get`, `post`, `put` and `delete` methods are also chainable so all our routes definitions can be reduced to the following:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-09-03/server/projects/routes.js#L18-L58)
