# Creating an Express Web Server

We will modify our previous web server [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-02-03/server/index.js) to use Express:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-01/server/index.js)

It really doesn't look that much different, we can actually see the difference [(:octocat:)](https://github.com/Satyam/book-react-redux/commit/aecc6b2b8c800f3be18ab90ac1b03da4c1d63075#diff-0861d6d6b50d7d695344bf2d86d6e5e6) in GitHub.

First we load the Express package into the constant `express` and then create an instance of the Express server by running the default function in the package, which we store in `app`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-01/server/index.js#L2-L3)

That `app` will handle the requests for us.  When we call `createServer`, instead of providing a function to handle the `'request'` event as we did before [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-02-03/server/index.js#L5), we let the Express request handler `app` to do it for us:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-01/server/index.js#L14)

That allows us to use the [Express router](http://expressjs.com/en/guide/routing.html).  There are four basic methods in the `app` object that corresponds to HTTP request methods: `app.get`, `app.post`, `app.put` and `app.delete`. These methods register a callback function to listen to a particular type of request. Each gets as its arguments the path they should respond to and the function to call back when the path is matched.

Here, we have used `app.get` which is the standard request you get when navigating to a URL.  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-01/server/index.js#L7)

The first argument is a wildcard `'*'` which means we want to respond to a request for any URL, the second is the very same arrow function we used earlier.  It still receives the very same `req` and `res` objects as before, but greatly augmented with very many extra properties and methods.   Using those new methods, we could now write our callback function like this:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-02/server/index.js#L11-L16)

The first thing to highlight is that the new methods are now chainable. The `type` method allows us to set the content type in a far easier way than `writeHead` did and likewise with `status`. Though the `send` method doesn't look that much different from `write` or `end` it is actually able to do some extra magic which we will use later on.

There is no limit to the number of routes you can register with the router.  We have added a couple of extra routes:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-02/server/index.js#L7-L9)

Now, if we navigate to `http://localhost:8080/hello` we will get `Hi, long time no see!` and if we go to `http://localhost:8080/bye` we get `See you later`. Since we haven't used neither `type` or `status`, Express will assume the default `text/html` content type and a 200 response status code. Since now the reply is HTML, the browser will show it in a different typeface than it did with the `text/plain` response.

The syntax of the new ES6 arrow functions allows us to write the callback far more succinctly than before.

Whatever other URL we navigate to, it will fall through to the wildcard response. Express matches the routes in the order they are registered so we should never put a the wildcard first because it would then match all requests and never reach the other responses.  We will rarely use such a catch-all wildcard route except for diagnostics.  The Express router will reply with a regular `404 Not Found` page if no route matches the requested URL.

The router also supports a [limited form](http://expressjs.com/en/guide/routing.html#route-paths) of regular expressions.

## Request parameters

It would be impossible to plan for routes matching all possible queries with variable parts.  Express allows for parameters within the routes.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-03/server/index.js#L7)

A segment of a path with a leading colon `:` and up to the next slash `/` represents a parameter. Express will accept anything in that position and will save it in the `req.params` object under the given parameter name.  The above will match `http://localhost:8080/hello/John` and reply with `Hi John, long time no see!`, however it will not match our previous `http://localhost:8080/hello` because there is no `/:name` parameter.  Parameters must be there for the route to match. However, a question mark `?` after the parameter name makes it optional.

Express will also accept any mix of fixed and variable parts:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-03/server/index.js#L9)

With such a route, navigating to `http://localhost:8080/elect/joe/doe/for/mayor` will produce `{"fname":"joe","lname":"doe","position":"mayor"}` and it will also accept `http://localhost:8080/elect/joe/for/mayor` resulting in `{"fname":"joe","position":"mayor"}`. The `send` method is smart enough to convert the `req.params` object to JSON when sending it.

Express will also look for query parameters (the part of the URL after the question mark). Query parameters do not affect the route.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-03/server/index.js#L11)

In response to `http://localhost:8080/search?q=whatever`, it will respond with `You are searching for "whatever"`.  In response to `http://localhost:8080/search ` it will reply `You are searching for "undefined"`.

Express cannot retrieve the part of the URL after the hash `#` mark since browsers do not send that to the server but handle it locally once the page has arrived.

## Using Middleware

The functionality offered by Express can be extended via *middleware*. Only one comes prepackaged, [`express.static`](http://expressjs.com/en/4x/api.html#express.static):

```js
app.use(express.static(path.join(__dirname, '../public')));
```

We are telling Express to `use` the `express.static` middleware which should serve static files from the `/public` folder within our project folder.  Middleware is registered in Express just like routes so the order is important. In general, our dynamic responses have to go first, otherwise Express might assume they are file requests.  Only if no route matches should Express look for static files.

The `path.join` function is part of NodeJS but it is not loaded by default so we had to add `const path = require('path');` to make it available.

We have dropped the wildcard route at the end of the list of routes because we are now serving actual files for everything but our matched routes or returning a `404 Not Found` error otherwise.  We now have a home page at `/public/index.html` [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/chapter-04-04/public). We could also put a `favicon.ico` there so it gets shown in the address bar.

We will add more middleware to our server which we first load:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-04/server/index.js#L5-L6)


and then use:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-04/server/index.js#L12-L13)

Unlike the `express.static` middleware, we put these two before our dynamic routes because we want them to have the request processed for any request. They don't send anything back to the browser. They act like filters, pre-processing the information received before it gets acted upon.

So far we have only dealt with HTTP GET requests and the information that comes encoded in the URL itself.  [`body-parser`](https://github.com/expressjs/body-parser#body-parser) allows us to access the information sent in the body of the request. When there is information sent in the body and it can be decoded, `body-parser` will populate the `req.body` object.

The body can be sent encoded in various ways and the `body-parser` middleware provides several decoders.  The original middleware tried to figure out how the body was encoded and produce some sort of result, which wasted processing time.  Now, we have to explicitly state which parser to use.  All parsers can be added and each will give it a try in turn. If a filter fails, it doesn't reject a request, it simply lets it pass through so other filter, if there is any other one after, can try.

## Reading data from a form

Our home page now has a form with a single input field in it:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-04/public/index.html#L10-L12)

The value of that field will be posted to the `/form` path, where we can read it:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-04/server/index.js#L23)

Here we have used `app.post` instead of `app.get` as we've done so far since that is the method declared in the `<form method="post">` tag.

Middleware can also be restricted to respond to specific routes.  For example, all our data *post*s and *put*s will go in JSON to the `/data` route so we limit our decoding to just that route leaving the rest to be url-decoded:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-04/server/index.js#L10)

We have also added the [`cookie-parser`](https://github.com/expressjs/cookie-parser) middleware which reads the cookies we might have sent in earlier responses via [`res.cookie`](http://expressjs.com/en/api.html#res.cookie) and makes them available in the `req.cookies` object.

We now have the `http://localhost:8080/cookie` path to read and increment the `chocolateChip` cookie count and `http://localhost:8080/naughtyChild` to clear it.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-04-04/server/index.js#L25-L36)

## Summary

We have seen how to create an Express server and tell it how to respond to various URLs and how to read extra query parameters.

We have also learned about *middleware* how to load it and use it in our web server.  We've seen how to load and use the body and cookie parser middleware besides the built int *static* middleware.  

We have used the body parser middleware to be able to decode information received from an HTML form and manipulated information in *cookies* via the cookie parser.
