# Switching to SQL

Our server has been working from data stored in memory, a solution workable only for the smallest data set.  To go any further we should go to some more serious data management system. We have to switch to SQL.

Why not a NoSQL database? The information we have been using so far looks pretty much like the hierarchical information that is usually stored in NoSQL databases so it should be easy to store it in one such.  

One reason to go the way of SQL is that it is, indeed, a challenge. We must support the agreed interface so we might as well prove that it can still be supported with any technology.  As long as it complies with the test suite we have written to validate our API, it really doesn't matter what is behind.

A second reason is that there is no NoSQL standard.  If we look at an SQL statement, we know what it means.  NoSQL databases are plagued with a wide variety of proprietary languages.  The purpose of this book is to look into React and Redux, not analyzing particular NoSQL dialects.

Finally, out of the many SQL variants, we will use [SQLite](https://www.sqlite.org) for its simplicity. It still falls short of any large-scale database management system or DBMS like the popular and also free [MySQL](http://www.mysql.com/), [PostgreSQL](http://www.postgresql.org/) or some larger commercial ones, but for the purpose of this book, it has the benefit of requiring no other installation than using NPM to load the corresponding package. SQLite manages its databases out of a simple file.  Opening a database simply means telling the SQLite driver which file to use. It is also so small that many applications use it to store its own data. For example, [Mozilla Thunderbird](https://www.mozilla.org/en-US/thunderbird/), a popular Open Source eMail client, creates several files with extension `.sqlite` that are SQLite databases just to hold configuration information.

Moreover, SQLite can use both temporary files or a memory store.  Both are valid through the duration of the application execution, which is all we need for the purpose of this book.

In our earlier version, we loaded the content of the `data.json` file in memory and handled all the data as a big global `data` object. Except for loading the `data.json` file into memory, all data operations where synchronous.  Now, using SQL, all our operations are asynchronous, which more closely resembles a real life scenario, and the purpose of this chapter is to explore that more thoroughly.

To load SQLite we follow the usual procedure. First, we use `npm i --save sqlite3` to download the package from the NPM registry.  Since we will use SQL in production, we use the `--save` option instead of `--save-dev` so it will be saved as a regular dependency in `package.json` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/package.json#L37).  Then, in our `server/index.js` file we add `const sqlite3 = require('sqlite3');` to load it as we have done with all the packages.  No news there.

So far, the only asynchronous operation we have seriously dealt with has been to put the HTTP server to listen.  We have ignored reading the `data.json` file, which is also an asynchronous operation, because we were going to drop it.  We are now dropping it but have added some more asynchronous operations.  Now, we do the following operations:

* Connect to the SQL database
* Load the `data.sql` file containing the database setup
* Make SQLite execute that file
* Setup some SQL *Prepared Statements*
* Set the HTTP server to listen to requests

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/index.js#L22-L46)

To make all those operations available both to run the server regularly via `npm start` or to test it via `npm t` or `npm run coverage` we create a `webServer object` containing a `start` and a `stop` function.  We export that `webServer` object for the benefit of our test script.

In the `start` method, we create a `new sqlite3.Database` which will be kept in memory.  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/index.js#L24)

We could use an actual file or pass an empty string which will tell SQLite to create a temporary file, but we don't really have that much data. We make that `db` instance global by assigning it to `global.db`.

Then, we use the FileSystem `fs` module to read `data.sql` which contains standard SQL statements to create and populate the tables to store our data.  Once read, we tell the `db` to execute `db.exec` all those statements at once.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/index.js#L26-L28)

We need to do some further setup in `server/projects.js` which is also asynchronous so we have added an extra argument to `projects`, we give it the router instance and now we also add a callback so it can tell us when it is done.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/index.js#L30)

Finally, we set our HTTP server to listen.

We do each operation sequentially. Each asynchronous operation takes a callback function whose first argument is an error object.  So, to proceed with each step we first check that the previous step has had no errors.  If `err` is not null, we call `done(err)` to notify our caller that there has been an error.  We have used a shortcut, we might have written this like this:

```js
if (err) {
  done(err);
  return;
}
```

But we know that `done` does not return anything, thus, we are free to write:

```js
if (err) return done(err);
```

Since `done` returns `undefined` and a solitary `return` is like `return undefined`, our shortcut works just the same.  We have not used this kind of shortcut elsewhere because we don't know what the callback might return.

For `close` we simply close the HTTP server.  Since the database is a temporary one in memory, it really doesn't matter if we close it or not.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/index.js#L42)

To start the server in production mode using `npm start`, we have:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/index.js#L48-L55)

Once again, we check if this module is the main one and, if so, we call `webServer.start` to get everything up and running.  We provide a callback function which `start` would receive as the `done` argument that, if it does receive an error, it shows it in the console and exits with an error code.

We have made the function which is the default export of `server/projects.js` an asynchronous one by adding just one more argument to it, the `done` callback. We had to do this because all SQL operations are asynchronous so at initialization time, when we setup the *prepared statements* we can let our caller know when we are done or otherwise signal an error.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/projects.js#L3)

A prepared statement is an optimization present in most varieties of SQL which allows the SQL engine to pre-compile and possibly optimize an SQL statement for future execution. For example, `selectAllProjects` contains the prepared statement `'select * from projects'`.

 [(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/projects.js#L3-L9)

Prepared statements can have variable parts which will be filled in when they are executed.  Variable parts can be represented in various ways, we have opted to use an identifier preceded by a `$` sign.  Thus when we want to execute `selectProjectByPid`, we have to provide an actual value for `$pid`.

Now, in response to a request for `/data/v1/projects`, we ask the `selectAllProjects` prepared statement to give us `all` the projects it can find.  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/projects.js#L32-L40)

We give '/' as the path since our `projectsRouter` already passes on only the requests to `/data/v1/projects`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/index.js#L16)

We call the `all` method on our `selectAllProjects` prepared statement, meaning, we want all the records it returns instead of one at a time. We provide it with a callback that will receive an error, if any, and an array containing all the projects if there is no error.  If we do get an error, we reply with a 500 HTTP error code along the text of the error or otherwise we send back those projects JSON-encoded.

We use a 500 error code here instead of the 404 we have used so far because the only reason for an error is a serious server-side error which fits the error standard description "500: Internal Server Error".  There are plenty of standard [HTTP Status Codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) already defined that cover most needs. It is better to use the correct HTTP error code.

Creating a new project via a POST to `/data/v1/projects` uses parameters:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/projects.js#L84-L95)

Here we run the `createProject` prepared statement filling in the `$name` and `$descr` variables with the corresponding information from the body of the request.  If there is an error, we report it back to the client with a 500 error code, otherwise, we get the `pid` of the newly inserted record which SQLite stores in `this.lastID`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/projects.js#L93)

SQLite has two such variables `lastID` which represents the row ID of the last record inserted and `changes` which returns a count of the number of records affected in an insert, update or delete statement.  There is only one copy of each per connection so they must be read immediately after the SQL operation and before any new operation is attempted.  Different SQL engines have different names for these variables but they are always there in one way or another.

We are not using any shortcut to return when an error is found.  The following may work, but it is not safe:

```js
if (err) return res.status(500).send(err);
```

If we did this, we would be returning a copy of `res` but we don't know what the Express router might do with that.  We might use:

```js
if (err) return void res.status(500).send(err);
```

But it lacks clarity, which is important for maintainability, unless the practice is standardized across the organization. One-off hacks are never a good idea but if it becomes standard practice, it would be OK (and it would allow us to improve our coverage statistics).

## Building SQL statements dynamically

We can't use SQL prepared statements everywhere. In an update, what is it we are updating, all of the record or just part of it? In a project, we might independently update the project name or its description.  In a task we might change the description or its completion status. Just two fields per record  would require three prepared statements, one with both SQL field names and another two, each for a separate field.  This is not acceptable.  With more fields the situation would be even worst. So, we build it dynamically by concatenating as many fields as values arrive in the request body:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-01/server/projects.js#L121-L145)

Since we have no prepared statement, we ask the `db` to `run` the `sql` statement we have just built by concatenating it in bits and pieces. We then provide the parameters to fill into the placeholders in the statement. If either of `name` or `descr` is `undefined` it will not show in the parameter list, but neither will it be in the statement so SQLite won't be expecting it.

## Regular anonymous functions vs. fat arrow functions

Our use of regular anonymous functions like in the code above and fat arrow functions elsewhere might seem capricious but it is not so. Fat arrow functions are the preferred choice because of their compact syntax and the way they handle `this`, which has always been an inconvenience in JavaScript.  Regular functions have their `this` either undefined or set to the global object. This was a problem for callbacks because they lost track of the `this` from the object instance they were contained in.  In contrast, fat arrow functions retain the `this` of their containing object.  

Many developers have turned this *issue* into an advantage. Both Mocha and the SQLite driver set the context (the value of `this`) to a value of their choice which gives access to properties or methods useful to the callback.  Within an `it` test in Mocha, `this.timeout(nnn)` allows delays in tests.  In `sqlite3`, `this.lastID` and `this.changes` are accessible to the callback of the SQL operations.  If we were to use fat arrow functions, the `this` that those utilities give us would be lost.

## Testing the changes

We won't go through all of the changes in `projects.js`, it is basically SQL data handling.  Once all the changes are done, we have to check them and we have two ways of doing so. As always, we run ESLint via `npm run lint`.  Even if we have added linting to our editor, it is better to do a full check anyway because editors usually lint only the files they actually show.  

Then, we need to run the tests via `npm t`.  These don't come good. Though 10 errors are reported, after analyzing them, it turns out they are only three different types.

1. We changed the way we report the error messages.  Before, we had `Project nnn not found` and `Task nnn not found`, now we have more descriptive messages such as `Task nnn in project nnn not found` which is better for debugging. This is not a big deal of a change since the message is informative and useful only for debugging but it hardly matters to our client software which will simply check for the 404 error, not for the message.

2. When we are testing whether the server returns a proper error when we are updating a non-existing record, we expect a `404 Not Found` error, however, we are getting a `500 Internal Server Error`.  This is because in our tests, we didn't bother sending any actual data to update since we expected an error.  This no longer works with SQL because we are generating the SQL statement dynamically and, if there are no fields to update, the statement is invalid and won't compile. This was an error on our test suite which caused an error different from what we expected.  However the server did report an error so, it is hardly questionable.

3. When doing an update we used to reply with the updated record. This is easy when the data is in memory, but it requires one more SQL operation. Retaining the original behavior would be costly.  Is that cost worth preserving the compatibility? This is not an unusual decision to take at an earlier stage as we are now at.

The first two errors are backward-compatible, a client would not complain about those.  The last one is not. However, it is hard to see an application that would complain about it, after all, the client already has the information, the server reply was just a confirmation, an expensive one at that.  So, we opt to accept the change in behavior.  We will not be providing the changed record on our updates, if we want it, you can always ask for it, which is what we do in our tests. Instead of just expecting the data to arrive with the reply to our update, we do an additional query to verify they were properly done  [(:octocat:)](https://github.com/Satyam/book-react-redux/commit/f1fcd70b708e832e3e98872dd27728cef5eef8b5#diff-ad3c25167d0354b9b277e3ab6f375274L289).

Many such changes in behavior are not so simple. The important lesson here is that to do this properly, we need to change the version number in `package.json`  from `"version": "0.1.0"` to:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-02/package.json#L3)

Whenever we change the first non-zero number part in our version, it means there has been a compatibility change.  If our module were to be listed as a dependency in some other `package.json` like this:

```json
"dependencies": {
  "how_to_do_a_todo_app": "^0.1.0"
}
```

NPM would load any version `0.1.0` or later, such as `0.1.1` or `0.1.999999` but it would never load `0.2.0` because when the first non-zero number changes, it means there is a compatibility issue.

Since we are still in the `0.x.x` version numbers, it means we are not yet in production so we are still free to do this kind of changes.  Later on, we would need to gently migrate our users to the new version. This would require us to handle two versions at once, the old one on the `/data/v1` route and the new one in `/data/v2`.

## Handling URL Query Parameters

Within a REST request, each part has a clear function. We have dealt with most of them, namely:

* The method (GET, POST, PUT, DELETE) tells the server what to do.

* The path (`projects/34/5`) identifies the item we mean to operate upon.

* The optional body of the request carries non-key data associated with that item, usually for insert or update operations.

* The optional query parameters (the part following the query mark in the URL) indicate options.

We may add query parameters to our REST API such as search conditions or which fields to return. Often, to handle those cases we need to build the SQL statement dynamically.  However, since the query parameters are usually an exception, we will still use the generic SQL prepared statement for the usual condition and a built one for the exceptional cases.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-03/server/projects.js#L30-L50)

We changed the route handler for the GET on `/` to handle query parameters.  Since one way or another we are going to use the same callback for queries with or without parameters, we first define the callback function `cb`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-03/server/projects.js#L31-L37)

We check whether there are any query parameters.  Express already parses the query parameters and places them in an object at `req.query`. If there are none, it will give us an empty object.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-03/server/projects.js#L38)

If there are no keys in `req.query` we use the `selectAllProjects` prepared statement, otherwise, we build the SQL statement into `sql` and run it.  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-03/server/projects.js#L41-L48)

If there is a `fields` key, we expect it to be a comma separated list of fields to list, such as `name,descr` and we concatenate that list, otherwise, we ask for all fields `'*'`.

If there is a `search` key, we assemble an SQL `where` clause.  We expect the search to be of the form `field=value` which we translate, via a regular expression, into `field like "%value%"` which is an SQL  *wildcard* search for that value anywhere within the field. This is just an example of how a search could be translated, many others would be just as good.  The REST API we are dealing with is not meant for direct human consumption so its syntax could be far more complex and/or cryptic,  after all, there will be client-side software to translate it from the user request.

As expected, we then test our changes [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-03/test/server.js#L89-L143).

## SQL Injection

The previous example shows us the danger of relying on information coming from a remote client to build an SQL statement. We may add the following test to our suite to see how it can be done:

```js
it('SQL injection ', () => http.get('/?fields=* from sqlite_master;select *')
  .then((response) => {
    expect(response.status).to.equal(200);
    expect(response.headers['content-type']).to.contain('application/json');
    const data = response.data;
    expect(data).to.be.an.instanceof(Array);
    console.log(data);
  })
);
```

Our server code accepts two query parameters, `fields` and `search`.  The first is expected to contain a comma-separated list of field names such as `?fields=name,pid` but what if it doesn't? In the code above we cheated the server and injected an extra SQL statement for the server to execute.  When that request is executed, the server code [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-03/server/projects.js#L41-L47) will produce the following SQL statement:

```sql
select * from sqlite_master;select * from projects
```

Many database engines can return the result of two queries at once or will return one or the other.  In this case, SQLite returns the first and ignores the second. The table `sqlite_master` is an internal table within SQLite that actually contains the information about all the other elements in the database.

```js
[ { type: 'table',
    name: 'projects',
    tbl_name: 'projects',
    rootpage: 2,
    sql: 'CREATE TABLE projects (\n  pid INTEGER PRIMARY KEY,\n  name TEXT,\n  descr TEXT\n)' },
  { type: 'table',
    name: 'tasks',
    tbl_name: 'tasks',
    rootpage: 3,
    sql: 'CREATE TABLE tasks (\n  tid INTEGER PRIMARY KEY,\n  pid INTEGER,\n  descr TEXT,\n  completed TINYINT\n)' } ]
```

It lists the only two elements we have created, the two tables `projects` and `tasks` and the SQL statements used for the creation of each, listing the fields and constraints for each.

Once we know the tables available in the server, we could then issue a HTTP GET request to  `'/projects?fields=* from projects;select *'` or any other table we had and steal whatever information is within reach.

This process is called SQL Injection and it is one of the main exploits to steal data from servers. We should always check the data received.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-04/server/projects.js#L41-L48)

Our test now shows that trying to inject anything unexpected fails.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-08-04/test/server.js#L145-L155)

We should never trust the information coming from a remote source.  It might not actually be a user on a browser.

## Summary

We have successfully migrated our server from using in-memory data to an external SQL database.

In doing so we have found that our original definition of our REST API had some expensive features. This required us to change the agreed interface causing a compatibility issue.  We indicated that by incrementing our version number of our code in `package.json`.

It was our tests that allowed us to discover this issue.  We should always write tests.

We have also shown how SQL injection can be done and how to prevent it by validating the requests.  And, of course, we tested for it.
