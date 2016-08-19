# Server-side Projects Data Handler

Our `projects` data handler is broken into three files:

* `index.js` contains the initialization code and returns a Promise resolved with an Express router.
* `transactions.js` contains the database operations that do the actual manipulation of the data in whichever DBMS system the system uses.
* `validators.js` contains validators for all the bits of data that might be received.

> Regardless of whatever client-side validation might be in place, all data received at the server must always be validated.

## Initialization

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/index.js#L7-L18)

The default export of the data handler must be a Promise which is resolved when any required initialization is done. Usually, it is the part dealing with the DBMS the one that might be asynchronous.  We have concentrated all our database operations in the `transactions.js` file, which has an `init` export which returns a Promise.

Our default export should return an Express router so, in the `.then` part after the initialization of the transactions, we call `createRouter`. A router with no routes to route would be of little use.  Fortunately, all the routing methods, i.e. `get`, `post` and so on, are chainable so we can call all those `get`s, `post`s and `put`s and still return the router, though now it would have plenty of routes to handle.

The routing method functions expect a path, which might contain parameters signaled by a leading colon `:` and the name that will be given to that parameter.  All those paths are relative to the route of our projects route, which is `/data/v2/projects`.

Each path can be followed by any number of middleware functions. We have used none in this case.  Then, the route handler which we called `handleRequest`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/utils.js#L3-L17)

`handleRequest` returns a function that will actually handle the request. It first extracts information from the request.  The object `o` contains three main properties:

* `keys` contains the identifiers that help locate the data. They are extracted from the request `params`.
* `options` may contain an object listing some processing options, extracted from the part of the URL after the query mark.
* `data` may contain data required by the operation, extracted from the body, decoded by `bodyParser.json()`

The change of names might be considered somewhat whimsical, however, they most closely represent the purpose of each element within the transaction than the names of the parts within the URL.

`handleRequest` expects an arbitrary number of arguments `args`.  All but the last are validators while the last is the one actually executing the transaction. They all receive a copy of the `o` object.

## Validators

All the validators are launched in parallel via `Promise.all`, under the assumption that they are independent of one another.  If any of them were not, then they should be sequenced outside of this.

Once all validators are finished, then the `action` is executed.  By this time, all values would have been validated and some of them converted.  The action is expected to be a value which is then send back to the client.

The `validators` are not expected to return anything except, possibly, a rejected Promise.  The `action` is expected to return data to be sent to the client but it might also return a rejected Promise. To help send those errors, the `failRequest` function creates a rejection:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/utils.js#L1)

If any do return a rejected Promise, the `reason` is expected to contain a `code` and a `message`. The `code` should be an HTTP error code, however, Promises can be rejected by throwing an Error. So, in case of any rejection, the Promise is caught and, if the `reason` is an instance of `Error`, an `500` HTTP status code is sent back as the HTTP status code and the `message` as the HTTP status text.  If it is not an instance of `Error`, then the `code` is sent.  Both have a `message` property so the text is always sent.

The function that validates project ids is a typical validator:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/validators.js#L7-L11)

The `pid` (project id) is the main record identifier for projects. The client expects it to be a string, for example a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier).  In our tiny database, our ids are actually integers from an auto-incremented primary key field.  Our validator then tries to convert it into a number.  If it turns out not to be a number, it fails with a `400`, `Bad request` error.  Otherwise, it saves the converted `pid` back into the `keys` property.

Other validators [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/validators.js) work pretty much like this one, they pick different pieces of data, do some validation and possible conversion and either fail with an error or do nothing which allows the request to carry on.

We have not been particularly original with our error messages.  In this implementation, the code should be a valid HTTP code which should be in the 4xx range. If there were other sources of errors that might not be instances of Error, they would have to be converted.

## Transactions

Our primitive SQL manager does require some initialization, namely preparing the SQL statements that will use later, which is done in the `init` function:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/transactions.js#L7-L27)

We use `db.prepare` to tell the driver to pre-compile the SQL statements so later executions will get faster.  We store them all into the `prepared` object. We will use the text of the `sqlAllProjects` statement elsewhere, that is why we have it defined separately. The `db` variable contains the reference to the database driver we inititialized and assigned to `global.db` on setting up the web server [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L32). All SQL.js operations are synchronous, however, our data handler code allows for asynchronous operations and expects a Promise so, at the end of the `init` function, we return a resolved Promise.

Most SQL statements listed contain identifiers starting with a `$` sign.  Those are placeholders for actual values that can be filled in later, when the query is actually performed.

A transaction will return the data to be returned to the client or a Promise that returns such data or it will throw an error or return Promise.reject, which amounts to very much the same.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/transactions.js#L80-L90)

We retrieve a task by calling the prepared statement in `prepared.selectTaskByTid`.  The `getAsObject` method retrieves the record as an object with the database column names as its property names. As an argument, `getAsObject` takes an object with the named placeholders, those identifiers starting with a `$` sign in the statement, and their values.  Since mapping the query parameters to those `$` placeholders is such a common operation, we have provided a `dolarizeQueryParams` function [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/utils.js#L19-L27) to do it for us.

If there is a `task` returned
