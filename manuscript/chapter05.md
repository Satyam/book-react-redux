# REST

Representational State Transfer, [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) is the standard way in which plain data, that is, not formatted for human consumption, is requested and transfered in the Web.

Every piece of data in the web can have an URL (or more precisely an URI, but we won't dwell on the difference) and from previous chapters, we know how we can respond to any URL our server receives.

Once we identified the data, we need to tell the server what to do with it. We have the HTTP request codes for that.  In data handling terms we have four basic operations known by their initials: Create, Read, Update and Delete (CRUD).  These map one to one with the HTTP request methods we've already mentioned though, unfortunately, they don't result in any acronym we could use:

* Create: POST
* Read: GET
* Update: PUT
* Delete: DELETE

So, if we do a GET to our server for, say, `/employees` we will get a list of all employees, but if we ask for `/employees/123435` we will get more detailed information about an employee with that record number.  If we POST an employee record to `/employees` it means we want to create a record for a new hire.  The server will respond with the record number it assigned to that employee (assuming, as it is often the case, that it is the server that assigns the record identifier). If we do a DELETE on `/employees/123435` that record would be deleted while if we do a PUT along some information, for example, a new home address because the employee has moved, the record for that employee would get updated.  In theory this scheme can be stretched to absurd limits `/employees/12345/lname/2` might mean the second character of the last name of that particular employee which just serves to show how generic and flexible URIs can be though it would be impractical to stretch it that far.

REST requests can be further qualified with query parameters.  For example, a GET on `/employees?search=lname%3DSmith` instead of bringing up the list of all employees, it would only return the results of performing the database search for employees whose last name is Smith: `lname=Smith` (the `%3D` is the url-encoding of the equals sign).  

We might handle further qualifiers, for example, `/employees?search=lname%3DSmith&fields=fname,ZIPcode` would return the names and postal codes for all the Smiths in the database.

It is also important to know who is asking for the information.  Nobody wants their salaries disclosed to just about anyone.  So, beyond what the URL says, the server has to decide whether someone can access or change some particular piece of information.  Usually this is done through *cookies*.  In the previous chapter we have already seen how to deal with cookies [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-04/server/index.js#L25-L36) using the `cookie-parser` middleware.  After the user is positively identified (logs in) we send as a cookie some temporary token that allows us to recognize that user during one particular session, and know his/her permissions.

Defining what URLs we support and the expected responses is a very important part of defining a project.  Many large web services companies have very well defined public APIs, for example [GitHub](https://developer.github.com/v3/repos/) or [Google](https://developers.google.com/gmail/api/v1/reference/), though some might adopt some [proprietary format](http://wiki.freebase.com/wiki/Mql).

Defining our API also allows us to split the responsibility of the project in between separate people, the server-side team dealing with responding to these requests and the client-side team taking care of requesting and presenting this information to the user and translating the user commands into server requests. The REST API is the contract in between these two teams.

## Defining our REST API

First, we have to separate our data requests from any other request our web-server might have to serve. Thus, the root for all our data requests will be `/data`.  This doesn't mean we have to create a folder of that name, it is simply a path our server will respond to.

Occasionally, it is a good idea to reflect on our own fallibility. We might get things wrong and if we define our API too rigidly, we might get in trouble. To be able to change our API in the future it is better to include a version number in our API requests so, if we ever have to change it, we change the version number. For a certain time, we can respond to requests in either format, both versions coexisting until everything gets updated and the old version finally gets dropped.  For this API we will then use the prefix `/data/v1`.

For our application, we will have a series of projects and for each project a series of tasks to perform.  This is just a twist on the popular TODO list application with one such TODO list for each of our projects.  This would be our API:

Method | URL | Description
-------|-----|----------
GET | `/projects` | Returns a list of project ids, names and descriptions
GET | `/projects/:pid` | Returns the name and description of the given project and its list of tasks, providing their id, description and completion status
GET | `projects/:pid/:tid` | Returns the task id, description and completion status for a particular task within a particular project
POST | `/projects` | Accepts the name and description for a new project, returns project id
POST | `/projects/:pid` | Accepts the description and completion status for a new task for a given project, returns the id for the new task. Completion status defaults to false.
PUT | `/projects/:pid/:tid` | Updates the given task with the information in the body
DELETE |`/projects/:pid/:tid` | Deletes the given task
DELETE |`/projects/:pid` | Deletes the given project and all its tasks

The REST standard doesn't really force you to do things in any particular way.  For example, deleting a project should also delete all existing tasks or should it fail if the task list is not empty?  When creating a new record, which fields are mandatory and which have defaults?  That behavior has to be described.  

Optional query parameters should also be specified such as those that allow queries by field value or to enumerate the fields to be returned, as we commented earlier.

## Loading sample data

For the time being, we will store our information in memory.  This is certainly not practical for any real-life application, but it will help us concentrate on issues other than data storage. Our data comes from a JSON file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/data.json) which we will read and keep in memory.

We need to load [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/index.js#L6) the [File System](https://nodejs.org/docs/latest/api/fs.html) package which is included in the NodeJS distribution so we don't need to install it via NPM.

```js
const fs = require('fs');
```

We then use the `readFile` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/index.js#L10) method to read the full file.  To compose the pathname to the file we use the [`path.join`](https://nodejs.org/docs/latest/api/path.html#path_path_join_path1_path2) method in a similar way we did when we set the folder to fetch static content from.

```js
fs.readFile(path.join(__dirname, 'data.json'), (err, data) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  global.data = JSON.parse(data);

  // ... rest of code

});
```

The `readFile` method is asynchronous so we have to provide a callback for it to tell us when the read has succeeded.  In most NodeJS async methods, the first argument is an error object which, if it is not `null`, means the operation has not succeeded.  If that is the case, we show the error and exit.  Otherwise, the second argument `data` will contain the full contents of the file.  Since it is in JSON, we parse it and save it to `global.data`.

## Global variables

As it name implies, [`global`](https://nodejs.org/docs/latest/api/globals.html) is NodeJS global object, available everywhere, much as the `window` object is in a browser.  Every property of `global` is accessible just by name, for example, there is `global.setTimeout` just like there is a `window.setTimeout` in the browser and both can be called by its name, `setTimeout`, the global name being implicit.  We have already used a couple of such properties.  Both `__dirname` and, to some extent, `require` are properties of `global`.

We can make our own properties globally accessible just by setting them as properties of `global`, we just have to make sure we are not colliding with an existing property.  Since we are going to use the data we've just read everywhere, it makes sense to make it globally accessible.

ESLint will complain about using the global variable `data`.  ESLint knows about the standard, well-known global names for [whichever environment](http://eslint.org/docs/user-guide/configuring#specifying-environments) we are working on, that is why we specified that our environment would be `node` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/.eslintrc.json#L3-L5).  If there is anything beyond those globals, it will flag it as an *undeclared* variable, which usually signals a typo.  To prevent that, we add our own list of globals (for the time being just `data`) to `eslintrc.json` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/.eslintrc.json#L9-L11):

```json
"globals": {
  "data": false
}
```

The `false` value means we don't want this global variable written, only read.  This might sound strange, how do we set it if it is read-only?  When we set it we did `global.data = .... whatever`. ESLint doesn't mind us changing the `data` property of the `global` object, it would have complained if we did `data = ... ` even though both amount to the same thing.

Our earlier server code has been trimmed of all those `app.get( ... ` routes we had put there to try out different features, which we don't need any more.  There is another change that might pass unnoticed, the earlier code is now contained within the callback function [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/index.js#L11-L30).  This is because only if and when we succeed reading the `data.json` file it makes any sense to start the web server.  It would make no sense to start it if there is no data to serve.

## Writing a module to respond to REST requests

The Express server has a default router which we have been using so far.  All those `app.get` we wrote earlier are registered with the default router which will dispatch each of the callbacks according to the full path in the URL received.  When we have many routes sharing the very same prefix, in this case `/data/v1`, it is inefficient (and boring) to repeat it over and over again.  For these cases we can create an additional router [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/index.js#L19-L23) that will respond to that prefix and will deal with the rest of the path from that point on.

```js
const projectsRouter = express.Router();
app.use('/data/v1/projects', projectsRouter);

const projects = require('./projects.js');
projects(projectsRouter);
```

First, we request a new router instance from Express which we call `projectsRouter`.  We tell our instance of the Express server to `use` that router to deal with paths starting with `/data/v1/projects`.  Finally, we call `projects` and provide it with this router instance.

Where did `projects` came from?  It is a module we created ourselves. We loaded it right before we used it [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/index.js#L22) via:

```js
const projects = require('./projects.js');
```

The `projects` come from the file `./projects.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/projects.js) which we created ourselves.  When the `require` function gets a module name starting with `.` or `/` it will not search for that module in the usual places ( NodeJS built-in library or `node_modules`) but will assume you are providing a full file name to a very specific file and load that one instead.

Loading modules in NodeJS is not the same as loading them in the browser via the `<script>` tag. In the browser, everything in the loaded file gets merged into whatever is already there, as if all those JavaScript files were concatenated together. This can get quite messy as all the variables declared in all files get into the same name space, possibly colliding with one another.

In NodeJS when you `require` another module, you only get to see whatever the loaded file exports.  In our sample, we export a *fat arrow* function [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/projects.js#L3) which will receive our router instance.

```js
module.exports = (router) => {
```

Since what we exported is a function, on the other side, we can execute it [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/index.js#L23):

```js
projects(projectsRouter);
```

For example, if we receive a request for `/data/v1/projects` the `projectsRouter` will recognize it is the path it is meant to respond to and pass on the implicit `/` at the end.  We then respond to the `/` path like this [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/projects.js#L5-L11):

```js
router.get('/', (req, res) => {
  res.json(Object.keys(data).map(pid => ({
    pid: pid,
    name: data[pid].name,
    descr: data[pid].descr
  })));
});
```

We use `Object.keys` list all the keys in the `data` object, which happen to be the `pid`s.  `Object.keys` returns an array and we use the `map` method of this Array instance.  We then use the `pid` to assemble each item in the response with the `pid` then the `name` and description `descr`.  Since `data` was set as a global earlier [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/index.js#L15) we can use it freely here.

We can use `res.send` instead of `res.json` since when Express is requested to send an Object or an Array, it will send it JSON-encoded.  However, it is better to state our intent as clearly as possible.

We can try it out by starting our server via `npm start` and then, in a browser go to `http://localhost:8080/data/v1/projects` which will show in our browser more or less like this:

```json
[{"pid":"25","name":"Writing a Book on Web Dev Tools","descr":"Tasks required to write a book on the tools required to develop a web application"},{"pid":"34","name":"Cook a Spanish omelette","descr":"Steps to cook a Spanish omelette or 'tortilla'"}]
```

It might not look good but it is not meant to be seen by humans, it is meant for our client-side code to read.  

For our second route [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/projects.js#L13-L20) `'/:pid'` we need to access the `pid` which we do by using `req.params.pid`:

```js
router.get('/:pid', (req, res) => {
  const prj = data[req.params.pid];
  if (prj) {
    res.json(prj);
  } else {
    res.status(404).send(`Project ${req.params.pid} not found`);
  }
});
```

If we find no actual project for that number, we respond with a regular `404` HTTP response code, however, in this case it is not a page that was not found but a specific project.

We respond very much the same way for the next route [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/projects.js#L22-L34) either with the task data or a 404 error when the project or the task is not found.

```js
router.get('/:pid/:tid', (req, res) => {
  const prj = data[req.params.pid];
  if (prj) {
    const task = prj.tasks[req.params.tid];
    if (task) {
      res.json(task);
    } else {
      res.status(404).send(`Task ${req.params.tid} not found`);
    }
  } else {
    res.status(404).send(`Project ${req.params.pid} not found`);
  }
});
```

For a POST operation, i.e.: adding a new record, we have to receive data, not send it.  We cannot receive large amounts of data via the URL as we have been doing with the few parameters we have been using so far.  To be able to receive data we need to access it from the body.

We have access to `req.body` because we already loaded the `body-parser` middleware.  Since we are only going to use JSON on the REST data exchanges, we will parse JSON [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/index.js#L17) only on the `/data` path.  We don't include the version part of the path since it is fair to assume that other versions would use the same data format.  Most middleware such as `body-parser` is quite versatile and tolerant.  If in a later version  we decide to use another data format, instead of failing, `body-parse` will let it go through, expecting that some later parser might deal with it.  Also, if we want to parse JSON on another path, we can add as many instances of `body-parser` elsewhere as needed.

To create a new project [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/projects.js#L36-L41) we first try to create a new project id `pid`.  We get it from the variable `nextId` which we set at the very top of the file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-05-01/server/index.js#L1)to a number larger than any ID in the data file.  We increment that value as soon as we read from it.  It might seem strange that we go through so much trouble to get a `pid` when we might as well push the new record into an Array of projects and figure out its position.  As it happens, we don't want to use an Array even though our indexes are numeric, because items within an array can move and what now has index 10 may become 9 after record 5 is deleted.  Though within JavaScript empty Array slots take no memory, there is no way to skip over empty slots in JSON.  We want our `pid`s and `tid`s to be permanent and not be just temporary indexes.  That is why we take the trouble of producing unique, permanent IDs.  In an SQL database, we would use an auto-increment integer field, in a noSQL database, we would take whatever unique record identifier that the database generated for us.

```js
router.post('/projects', (req, res) => {
  let pid = Object.keys(data).length;
  while (pid in data) pid++;
  let prj = Object.assign({name: '', descr: ''}, req.body || {});
  data[pid] = prj;
  res.json({pid: pid});
});
```

We count how many keys our `data` object has and try that for our `pid`.  We check whether there is already a record with that key and if there is, we increment it. This is not an optimal strategy but it is good enough for this example.

We build our new record using `Object.assign` to merge a couple of default values with the data coming from the client in `req.body`.  Since there might be no data (we might want to validate for that) we also default to an empty object.

We then store that project record into the array at the position given by our new `pid` and return that `pid` to the client.

For updating records via `put` we first locate the existing record (project or task) and use `Object.assign` to merge the new values from `req.body` into the existing record.  We return an error if the record does not exist.

For deleting we simply delete the whole entry.  We first try to locate the record to be deleted and return an error if not found.  We might have handled things differently.  We might not check for the existence of the record assuming that if not found it has already been deleted, which should be fine as that is what the user wanted.  We might have also returned the old record as it was before deletion though, being a potentially big piece of data, it might be a waste of bandwidth.  If the client code wanted it, it might have gotten it first.

## Summary

We have learned about the REST (**Re**presentational **S**tate **T**ransfer) protocol to accept and respond to data requests from the client.  We have defined the API we will be using in our application.

We have loaded a sample of data and showed how we can read it via suitable URLs.

We have learned how to write our own modules which we can use as well as the ones loaded via NPM.  We wrote one such module to  handle our REST request.

By separating our code into various modules we keep each modules small, focused and thus easy to understand and maintain.
