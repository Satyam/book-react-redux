# Client side

## The way not to do it

Perhaps the best way to learn why we do things in a certain way is to see what would happen if we did it otherwise.  This is our new `index.html` file that shows the list of projects in the database.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-10-01/public/index.html)

In the body we create a `<div id="contents">` to put our page content in.  We then load Axios, our HTTP request library, from `node_modules`. We added a new route for static content to our Express server to let it access `node_modules`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-10-01/server/index.js#L18-L19)

While the regular `use` of the `express.static` middleware is a catch-all for any path not already taken care for, in this new route we specifically tell it to deal with routes pointing to `node_modules`.  As such, we place it before the catch-all.  Though in this case it wouldn't have made a difference, it is always better to place the more specific routes before the more generic ones.

Since the browser doesn't know about `package.json` and NodeJS's module search mechanism, we have to be very specific regarding the exact location of the file we are loading as the browser won't look for it.  As a matter of fact, our server-side NodeJS script would load the version in `axios/lib` while we load the one in `axios/dist`. They are slightly different and we will see why later.

The code in this page simply sends an HTTP GET request to `'/data/v1/projects'` using Axios, just as we have already done in our Mocha tests in earlier chapters. On receiving the response, we locate the `<div>` by its ID and set its `innerHTML` to the string we compose using ES2015 template strings. With the ability to interpolate any sort of expressions into the template placeholders and the ability to extend to multiple lines, this looks pretty much like using PHP jumping in and out of HTML to PHP mode or, in this case, from template string to JS expression.

We have done pretty much the same with project.html with a different template and a different data request.  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-10-01/public/project.html#L1-L27)

For `project.html` we build the URL dynamically:

[(:memo:js)](https://github.com/Satyam/book-react-redux/blob/chapter-10-01/public/project.html#L11)

To try out these pages, we start the server as usual with `npm start` and then navigate to `http://localhost:8080` to get the project list and, by clicking on any of the projects, to each of the tasks list.

Depending on which browser we have and which version it is, this app may or may not work. ECMAScript 2015 is just starting to show up in some browsers and neither template strings or fat arrow functions might work. These are changes to the language itself and a pre-ES2015 browser will not even understand the script. It certainly will not work for most of our potential users.

## Polyfills

Older browsers will also lack Promises which Axios uses extensively. This is a different kind of error because this can be patched, it is a missing global object which can be added. It can also be a property within an existing object, such as `Object.keys` which can also be added. These are called *polyfills* and, if we check, for example, Mozilla's documentation, we [will see](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Polyfill) such polyfills listed for each method recently added.

Thus, we can change our code to make it available to more browsers.  It doesn't take long, we just need to add a couple of external scripts and change something.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-10-02/public/index.html#L10)

We simply added two extra external scripts.  The first one, from `polyfill.io` is from [FT Labs](http://cdn.polyfill.io/v1/docs/), the web development team at the Financial Times newspaper. It reads the `user-agent` header from the HTTP request which identifies which browser is making the request, for example, in the one I'm using right now, it shows:

```
User-Agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.97 Safari/537.36
```

In this case, this strings identifies the browser as Google Chrome major version 48.  It then goes to its own [features table](http://cdn.polyfill.io/v1/docs/features/) and decides it doesn't need almost anything and returns less than 1k of polyfills.  On the other hand, if I go to my old laptop with IE9 the polyfills add up to almost 5k. In this case, the base URL has `?features=Promise` added because developers might not be using Promises at all or might have already been using their own polyfill for that so FT Labs polyfill service doesn't include it by default and you have to request it explicitly. Once again, in modern browsers it wouldn't bother to load it at all since it is already there, but would load it for older browsers.

## Transpiling

As for the language issue, it is somewhat more complex because it is a change to the language itself, not just to a part of its built-in library.  To deal with that, we need a *transpiler*, a sort of compiler that instead of generating native machine code, it simply translates source code from one version of a language to a different version of the very same language.

Here we are using [Babel](http://babeljs.io/) which has become the standard.  We are loading the browser version of Babel to let it transpile on the client-side.  To let Babel know what it is expected to transpile, we have changed the `<script>` tag enclosing our code to signal it as of `type="text/babel"`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-10-02/public/index.html#L11-L12)

By default the type of `<script>` tags is `text/javascript` which will make the browser execute the code within.  However, if the `type` given is any other, the browser will ignore it.  That gives Babel a chance to do something about that code before the browser attempts to understand it.  Babel searches for all `<script type="text/babel">`, transpiles them and executes the resulting code.

This is what Babel ends up with for the code in in IE9 (Babel skips transpiling features that the browser supports natively so in my latest Chrome, Babel does nothing):

```js
function anonymous() {
  'use strict';

  axios.get('/data/v1/projects/' + window.location.search.substr(1)).then(function (response) {
    var prj = response.data;
    document.getElementById('contents').innerHTML = '<h1>' + prj.name + '</h1><p>' + prj.descr + '</p><ul>' + Object.keys(prj.tasks).map(function (tid) {
      var task = prj.tasks[tid];
      return '<li><input type="checkbox" ' + (task.completed ? 'checked' : '') + ' /> &nbsp; ' + task.descr + '</li>';
    }).join('\n') + '</ul>';
    document.title = 'Project ' + prj.pid + ': ' + prj.name;
  });
}
```

All the fat arrow functions have been changed to regular functions, the `const`s turned into `var`s and the template string replaced by a simple concatenation of small segments of string. If `this` had been used at any point within the fat arrow function, Babel would have provided a copy of the context of the enclosing function for the inner function to use. It is smart enough to know when it is not needed at all so in more modern browsers, it doesn't change the code at all.

When running this version of our client-code, there is a noticeable delay until the page shows up.  This is not just because all of the Babel transpiler had to load but it also has to run and transpile the code.  With a modern browser, it would probably figure out it doesn't really need to do anything at all, but it first has to check it all out.

So, even if not used, Babel is a hefty load. It doesn't make sense to force such a big download and heavy processing to the client.  To any and all clients, some powerful, some not so much, some with good and fast connections, some on a tablet on a 3G cell-phone network.

That is why the above mechanism has been deprecated by the developers of Babel. We are loading the 5.x version of Babel because there is no 6.x version of this particular browser-side transpiler.  I doubt that it has ever been used on a production environment at all. Instead, we will transpile off-line as part of the development process.

To do that, we will install the command-line version of Babel:

```
npm install --save-dev babel-cli babel-preset-es2015
```

This installs Babel and the presets to transpile EcmaScript 2015 and also saves the dependencies to `package.json`. As shown above, NPM can install more than one package in one go.  

We will also add an extra script to `package.json`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-10-03/package.json#L11)

This will allow us to transpile every script found in the `client` folder into old-style JavaScript, using the `es2015` presets into the `lib` folder under the `public` folder which we already reserved for files meant for the browser.

Thus, we need to separate the in-line scripts from the html files and place them in the `client` folder.  For example, `client/project.js` looks like this:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-10-03/client/project.js)

The code is the same as it was within the script tag in `projects.html`.

Now, if we do:

```
npm run build
```

Babel will create two files in `/public/lib` for each of the original JS files.  They look just like the one shown before produced by the in-browser transpiler

We now have to include it into the HTML page and drop the Babel in-line compiler:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-10-03/public/project.html)

Finally, since the files in `/public/lib` are generated as the product of those in `/client`, we add them to `.gitignore` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-10-03/.gitignore#L29) so they don't get uploaded into the GitHub repository. We also add that folder to `.eslintignore` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-10-03/.eslintignore#L3) so they won't be linted, because they will fail.  We have also added a `/client/.eslintrc.json` to tell ESLint that the contents of that folder are meant to be run in a browser so it should expect to find well-known globals such as `window` or `document` and also tell it to expect `axios` as a global variable.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-10-03/client/.eslintrc.json)

When starting the server via `npm start` and then pointing the browser to `http://localhost:8080`, the pages will show up immediately.  Instead of wasting time having the browser load Babel and then letting it transpile the code for us, we did that off-line via `npm run build` so the transpiled version is immediately available.  All browsers, even modern ones supporting ES2015, will get the old-style JavaScript code which doesn't use the new features.
