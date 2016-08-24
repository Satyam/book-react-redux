# Server-side Projects Data Handler

Our `projects` data handler is broken into three files:

* `index.js` contains the initialization code and returns a Promise resolved with an Express router.
* `transactions.js` contains the database operations that do the actual manipulation of the data in whichever DBMS system the system uses.
* `validators.js` contains validators for all the bits of data that might be received.

> Regardless of whatever client-side validation might be in place, all data received at the server must always be validated.

## Initialization

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/index.js#L7-L18)

The default export of the data handler must be a Promise which is resolved when any required initialization is done. Usually, it is the part dealing with the DBMS the one that might be asynchronous.  We have concentrated all our database operations in the `transactions.js` file, which has an `init` export which returns a Promise.

Our default export should return an Express router so, in the `.then` part after the initialization of the transactions, we call `createRouter` te get a new one. A router with no routes would be of little use.  Fortunately, all the routing methods, i.e. `get`, `post` and so on, are chainable so we can call all those `get`s, `post`s and `put`s and still return the router, though now it would have plenty of routes to handle.

The routing method functions expect a path, which might contain parameters signaled by a leading colon `:` and the name that will be given to that parameter.  All those paths are relative to the route of our projects route, which is `/data/v2/projects`.

Each path can be followed by any number of middleware functions. We have used none in this case.  Then, the route handler which we called `handleRequest`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/utils.js#L3-L17)

`handleRequest` returns a function that will actually handle the request. It first extracts information from the request.  The object `o` contains three main properties:

* `keys` contains the identifiers that help locate the data. They are extracted from the request `params`.
* `options` will be an object that may contain some processing options, extracted from the part of the URL after the query mark.
* `data` may contain data required by the operation, extracted from the body, decoded by `bodyParser.json()`

The change of names might be considered somewhat whimsical, however, they most closely represent the purpose of each element within the transaction than the names of the parts within the URL.

`handleRequest` expects an arbitrary number of arguments `args`.  All but the last are validators while the last is the one actually executing the transaction. They all receive a copy of the `o` object.

All the validators are launched in parallel via `Promise.all`, under the assumption that they are independent of one another.  If any of them were not, then they should be sequenced elsewhere.

Once all validators are finished, `then` the `action` is executed.  By this time, all values would have been validated and some of them converted.  The action is expected to return a value (or a Promise to return one) which is then send back to the client via `res.json()`.

The `validators` are not expected to return anything except, possibly, a rejected Promise.  The `action` is expected to return data to be sent to the client but it might also return a rejected Promise. To help send those errors, the `failRequest` function creates a rejection:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/utils.js#L1)

If any do return a rejected Promise, the last `catch` in the chain will receive a `reason` which is expected to contain a `code` and a `message`. The `code` should be an HTTP error code, however, any of the validators or actions might actually throw an error. So, in case of any rejection, the Promise is caught and, if the `reason` is an instance of `Error`, an `500` HTTP status code is sent back as the HTTP status code and the `message` as the HTTP status text.  If it is not an instance of `Error`, then the `code` is sent.  Both have a `message` property so the text is always sent.

## Validators

The function that validates project ids is a typical validator:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/validators.js#L7-L11)

The `pid` (project id) is the main record identifier for projects. The client expects it to be a string, for example a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier).  In our tiny database, our ids are actually integers from an auto-incremented primary-key field.  Our validator then tries to convert it into a number.  If it turns out not to be a number, it fails with a `400`, `Bad request` error.  Otherwise, it saves the converted `pid` back into the `keys` property.

Other validators [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/validators.js) work pretty much like this one, they pick different pieces of data, do some validation and possibly a conversion and either fail with an rejection or do nothing which allows the request to carry on.

We have not been particularly original with our error messages.  In this implementation, the code should be a valid HTTP code which should be in the 4xx range. If there were other sources of errors that might not be instances of Error, they would have to be converted.

## Transactions

Our primitive SQL manager does require some initialization, namely preparing the SQL statements that we will use later, which is done in the `init` function:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/transactions.js#L7-L27)

We use `db.prepare` to tell the driver to pre-compile the SQL statements so later executions will run faster.  We store them all into the `prepared` object. We will use the text of the `sqlAllProjects` statement elsewhere, that is why we have it defined separately. The `db` variable contains the reference to the database driver we inititialized and assigned to `global.db` on setting up the web server [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/server.js#L32). All SQL.js operations are synchronous, however, our data handler code allows for asynchronous operations and expects a Promise so, at the end of the `init` function, we return a resolved Promise.

Most SQL statements listed contain identifiers starting with a `$` sign.  Those are placeholders for actual values that must be filled in later, when the query is actually performed.

A transaction will either return the data to be sent back to the client or a Promise to return such data or it will return Promise.reject and, of course, it may always throw an error, which also implies a rejection.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/transactions.js#L88-L99)

We retrieve a task by calling the prepared statement in `prepared.selectTaskByTid`.  The `getAsObject` method retrieves the record as an object with the database column names as its property names. As an argument, `getAsObject` takes an object with the named placeholders, those identifiers starting with a `$` sign in the statement, and their values.  Since mapping the query parameters to those `$` placeholders is such a common operation, we have provided a `dolarizeQueryParams` function [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/utils.js#L19-L27) to do it for us.

Since an object is always returned, we check to see if it is empty by checking a mandatory field, `task.tid`. Auto-incremented SQL fields can never be zero so this is an easy and safe way to do such a test.  So, if there is no `tid` then we return a rejection. Otherwise, we do some field conversions we return the retrieved task record.  SQLite has no booleans, only 0 or non-zero integer fields, so `completed` must be converted. `pid`s and `tid`s must be converted from integers, as they exist in the database, to strings.

In either case, once used, the prepared statement must be `reset` to have it ready for later queries.  This is an idiosyncrasy of SQL.js.

Other transactions such as `getAllProjects` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/transactions.js#L29-L54) may potentially return too many records so we might want to limit both the number of records and/or the columns returned.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/transactions.js#L42-L53)

We read the `fields`, which contains a comma delimited list of fields to retrieve, and `search` which contains a column name and a value to be contained within that column.  Both options have been already validated to contain only  strings in that format.

If there are either search term or list of fields, instead of using the `prepared.selectAllProjects` prepared statement, we build one on the fly by doing some string manipulation using the `sqlAllProjects` SQL statement which we had set aside [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/transactions.js#L7-L10) on initialization.

Either way, we fetch those records in the usual SQL.js way:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/transactions.js#L30-L40)

The `step` method advances the cursor to each successive record and `getAsObject` does the actual reading of each record. After converting the values that need conversion, the records are pushed into the `projects` array which eventually gets returned.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/server/projects/transactions.js#L74-L86)

Transactions might use one another, in this case, `getProjectById` uses `getTasksByPid`.  Though the latter usually returns an array of tasks, we must remember that it may return a Promise, a rejected Promise at that so, we use `Promise.resolve` when calling it so we ensure it does get treated as a Promise.
