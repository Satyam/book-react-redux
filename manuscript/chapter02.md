# Creating a simple web server

NodeJS has been designed to be used primarily in web sites so creating a web server is pretty easy. In many other languages such as PHP we would need to have a web server, such as [Apache](https://httpd.apache.org/) plus the interpreter for [PHP](http://www.php.net/). Not so in NodeJS. The following code [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-02-01/server/index.js) is all we need to start with:

```js
const http = require('http');

const PORT = 8080;

const server = http.createServer();

server.on('request', (req, res) => {
  console.log(`Received request for ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Hello World!\n');
  res.end(`Received request for ${req.url}`);
});

server.on('listening', (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Server running at http://localhost:${PORT}/`);
  }
});

server.listen(PORT);
```

> All the code for the book is available at [https://github.com/Satyam/book-react-redux](https://github.com/Satyam/book-react-redux) which includes [instructions](https://github.com/Satyam/book-react-redux#book-react-redux) on how to see or download the code for any of the chapters.

NodeJS programs are made of *modules*, little bits of code that provide useful functionality.  NodeJS already offers a good number of such [modules](https://nodejs.org/docs/latest/api/index.html).  One of them is `http` and to load it [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-02-01/server/index.js#L1), we use `require('http')`.  We save a reference to that module in the `http` constant.  It is usual, though not required, to name the references to the modules after the name of the module itself.

We are using the `const` keyword instead of a simple `var` because we want to make sure we don't accidentally change its contents later on.  It might surprise C programmers because in in C constants are numeric or string literals.  In JavaScript any variable can contain anything, numbers, booleans, functions or full objects.  By declaring it as `const` we just mean that we want to protect it from accidental changes later on.

`PORT` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-02-01/server/index.js#L3) is more of a traditional constant in the C sense, a plain numeric value.  Following the regular convention, we use an all-uppercase name for it.  This is not mandatory, just a convention.  The `PORT` will be the part after the `:` in the URL:

`http://localhost:8080`

We might already have an active web server running on our machine which will be listening in the standard port number of 80.  We don't want to interfere with your existing web server so we put ours to listen on another port.  The low port numbers (below 1024) are mostly reserved for [well known services](https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports).  It is customary to use 8080 for temporary test web servers.  If we get an error stating that the port is already in use, simply use some other number.

The `http.createServer` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-02-01/server/index.js#L5) function creates an instance of a web server, which we save into the variable `server` declared as a constant to keep it safe.

We want to know when our server receives any request, that is, a user has navigated to an URL on this web server.  So, we tell [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-02-01/server/index.js#L7-L12) the `server` that `on` receiving a `'request'` it should let us know.  It will do so by calling the function we provide.  We are using [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) which were incorporated in ECMAScript 2015 or *ES6* as it is often called (`const` is also new to ES6). Basically, the two fragments below are more or less equivalent:

```js
(req, res) => {

function (req, res) {
```

So, for each request our web server receives it will call our function providing it with two arguments, a request `req`, containing information about the request such as the URL (`req.url`) or the headers.  It also provides a response object `res` that allows us to return a response to the browser.

We use `res.writeHead` to start the reply to the browser by giving it the 200 HTTP response code for Ok, then we add one header to change the default `Content-Type` of `text/html`.  We want to send back plain text instead of HTML so we change it to `text/plain`.

With `res.write` we start sending the text we mean to show on the browser. The *response* object `res` will keep accepting text as long as we keep writing into it.  To tell it we are done we do a final call to `res.end`. We are using the same [template string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings) as in the earlier `console.log` where we tell JavaScript to interpolate the value of `req.url` into the template.

We also want to know when the server becomes ready to start listening [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-02-01/server/index.js#L14-L20) so we ask the `server` that `on` `'listening'`, it should let us know by calling the function we provide.  This is also an *arrow function*. It receives an `error` argument which, if not null, will contain an error message, otherwise, it means the server is ready.

Finally [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-02-01/server/index.js#L22) we tell the `server` we want to `listen` on the given `PORT`.  

You might have noticed in some of the links above (the ones with the OctoCat :octocat:) that they point  to highlighted lines or ranges of lines in the sample code in GitHub.  This is just one of many features in GitHub that makes it great when doing development in teams, we can use these links to talk about code with other people, as we are doing here.

We can run this brief script by typing `node server`.  Since `server` is a folder, NodeJS will try to run a file named `index.js`.  The program will soon print `Server running at http://localhost:8080/`.

Now, if we go to a browser and navigate to that URL, the server script will print:

```
Received request for /
Received request for /favicon.ico
```

The first line is due to the URL we requested.  The second is because most modern browsers look for a file called `favicon.ico` at the root of the site, which it will use as the icon to associate with the site.

On the browser, we will see the reply from the server:

```
Hello World!
Received request for /
```

We can add whatever we want to that URL and the server will report whatever else we asked after the site root.  Thus `http://localhost:8080/this/that?something=else` will produce:

```
Hello World!
Received request for /this/that?something=else
```

By parsing and analyzing the URL and the rest of the information the `request` object provides we can respond in any way we want by sending back files, presumably HTML files or images, or assembling web pages on the fly.  Doing all these would be somewhat tiresome, like re-inventing the wheel.  Instead, in the next chapter, we will use a *package* which will do much of the work for us.  

## Important NodeJS features

This simple example allows us to learn about some of the goodies that JavaScript and NodeJS gives us.

### Modules

NodeJS allows us to break up a big project into little pieces called *modules*, each a piece of JavaScript code that does very well a very simple thing.  This is great for working in teams because each individual can concentrate on a simple, well-defined module and not be concerned with anything beyond.  Even a single solitary developer benefits from Modules because it makes it easy to know where the various parts of a project go.  It also allows us to reuse the same code over and over again.

Modules are gathered into *packages*. NodeJS comes with NPM, its own package manager.  A public repository of packages [npmjs.com](https://www.npmjs.com/) collects thousands of packages.  We will use one of those in the next chapter to improve on our web server.  [Express](https://www.npmjs.com/package/express) is actually one of the most popular packages for NodeJS.  

Let us have a look at the entry for [Express](https://www.npmjs.com/package/express) in the NPM registry.  On the right hand there is a column with plenty of information. They are on a 4.xx version, which means it is a mature product that has gone through many major revisions. It has an MIT license meaning we can freely use it. There is a link to the GitHub repository [(:octocat:)](github.com/strongloop/express) where we can find the source code and all the history of its development.  We can see that in the last month it had millions of downloads, which speaks of its popularity.

If we scroll further down, we can see a list of Dependencies and Dependents.  Here lies the beauty of packages and of the whole NPM ecosystem.  Each developer does something that depends on the code done by someone else and will see his/her own package used by others and depended upon by many other packages.

This is open source at its best.

### Event loop

Much of the efficiency and simplicity of NodeJS comes from the *event loop*. *Events* are simply things that happen.  We are used to events such as button clicks in the browser.  We don't know when or even if an event will happen, it is up to the user of the browser. This has proved a powerful concept in interfacing with the user.  Instead of prompting the user for information one piece at a time as we did in the age of teletypewriters (well, at least some of us did), we give the user freedom to interact with our pages in multiple ways and have our applications respond to that.

It seems a little bit of a stretch to extend this to the server, where there is no user, however, it works wonderfully well, as we've seen.  In our simple web server, we don't know when a request from a browser will come.  Thus, we tell our `server` that `on` receiving a `'request'` it should let us know.  Likewise, we don't know how long will it take to setup the server and get it ready to `listen` to requests so, we tell the `server` that `on` becoming ready to start `'listening'`, it should tell us.

This is thanks to the *event loop*. After initializing, NodeJS reads and executes the script and then enters what is called the *event loop*. If there is anything listening `on` something else, it just stays there waiting for that something to happen.  When an event happens, it notifies whomever it might concern by executing the function provided as a callback and loops back to the event loop.  While NodeJS is executing those callbacks, events get queued so on returning to the event loop NodeJS first checks the queue and processes the events queued in it.

NodeJS changes the way we do many other operations, for example, reading a file.  In most other languages, we have to open the file and read it.  When we tell the operating system (*OS*) to open the file, our application is temporarily frozen until the OS does get the file open and returns a handle.  Then, when we order the OS to read the file, our program gets frozen once again until the file is actually read and its contents made available somehow to our program.  NodeJS doesn't work like that (it can, but it is not encouraged).

In NodeJS, we tell the OS that we wish to have the file opened and tell it to let us know when it has complied.  Likewise, when we read from a file, we tell the OS to read the file for us and let us know when the chunk we have requested is available.  Our program is never frozen. Once we place our requests to the OS, we are free to continue doing something else or, most likely, go idle, allowing NodeJS to return to the event loop and see if something else has happened that might be of interest to some other application.

Contrast this to, for example, PHP.  It has the library functions to write a simple web server just like NodeJS but it cannot deal with concurrency, that is, multiple request coming from various sources.  It can easily do one at a time and, in principle, it seems NodeJS does the same.  However, there is a big difference. When the incoming request needs a file to be read, PHP freezes until the read operation is done and no other request can be processed.  NodeJS doesn't freeze, it simply returns to the event loop and allows other events to be processed, be them further HTTP requests or files read by previous requests that are still pending.  That is why PHP and so many other languages require complex environments such as an [Apache web server](http://httpd.apache.org/) or Microsoft's [IIS](https://www.iis.net/) to juggle with the various PHP processes each dealing with a single request.

### Callbacks

Unlike in most other languages, functions in JavaScript are just one more type of object and they can be assigned to variables, passed as arguments to functions and, of course, called.  This sits nicely with the event loop because that is the way to tell NodeJS or the browser what to do when an event happens.  We just give it a function.  Basically, we are saying "when *this* happens, call me back". It is the kind of thing we would wish we could do when calling customer support; instead of listening to the "All our customer support representatives are busy ... yada yada ..." we let them know we need help and have them call us back. That is why we have *callback* functions.

In the code above, we have supplied both our event listeners with callback functions.  In one we print suitable messages depending on whether the server succeeded in listening to incoming requests, in the other we process those requests.

In other languages, for example, Java, we cannot use functions so freely because we cannot pass functions as arguments.  Instead we have to define a class which implements a particular interface that declares a method which will be called when the event occurs, then we pass the whole class instance to the event listener.  Sounds complicated?  Well, you get used to it, but the JavaScript way is so much easier!  And since ES6 and its *arrow functions* it is even easier.  In JavaScript, when we need a function, we write it right there.  

### Chaining

Functions don't always return values.  In other languages we had *functions*, which always return some value, and *subroutines* or *procedures* which we call (often using the `call` statement) to do something, but that don't return anything.

In JavaScript there are only functions and they always return something, even if that something is `undefined`.  Someone, and I think it was John Resig in jQuery, thought that returning `undefined` was a waste so all the methods (functions in object instances) that have nothing better to return will return a reference to itself.
In our sample web server, we call several functions within the `server` instance (that is, *methods*) and never use any return from those functions.  Actually, all those functions return a reference to the same object they belong to.  

Using those references to the very same object they belong to allow for what is called *chaining* where we can chain one function call right after the other.

We can see this in action in the following example [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-02-02/server/index.js):

```js
const http = require('http');

const PORT = 8080;

http.createServer()
  .on('request', (req, res) => {
    console.log(`Received request for ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello World!\n');
    res.end(`Received request for ${req.url}`);
  })
  .on('listening', (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log(`Server running at http://localhost:${PORT}/`);
    }
  })
  .listen(PORT);
```

It is our very same web server changed to use chaining.  First thing to notice is that we are no longer declaring a variable `server`.  The `http.createServer()` function already returns an instance of an HTTP server and all the functions, such as `on` that would otherwise have nothing better to return, keep returning references to the same HTTP server instance they belong to.  We have chained several operations one after another to the same instance.

Good styling dictates that when doing chaining the chained functions (`.on` or `.listen`) to start with the dot on a separate line indented one position from the original source of the object instance.  All functions chained to the same object should be at the same depth.  Also note that there are no semicolons at the end of the chained functions because otherwise the statement would be finished and the object reference lost.

You might expect `res` to be similarly chainable but, unfortunately it is not. the `write` method does return information while the other two used here return `undefined`, which is a waste.

## ... and finally

We shorten our code even more as shown [here](https://github.com/Satyam/book-react-redux/blob/chapter-02-03/server/index.js):

```js
const http = require('http');

const PORT = 8080;

http.createServer((req, res) => {
    console.log(`Received request for ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello World!\n');
    res.end(`Received request for ${req.url}`);
  })
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
```

Subscribing to the `request` and `listening` events is such a frequent thing to do that the developers of the `http` module have made it easier, we just pass the request handler function to the `createServer` method and the `listening` callback to the `listen` method.  Also, we don't actually need to check for the `error` argument because most of the errors at that stage simply produce fatal errors and the application will terminate before we have any chance to do something about it.
