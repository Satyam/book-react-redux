# Client-side Routing

In our latest version of `router.js` we used regular expressions to match the URL of the page requested to the routes we are handling so as to run either of our rendering scripts.  Basically, it is the equivalent of what we've been doing in the server thanks to Express.  There is client software to do the same on the client.  This is our routes configuration

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-01/client/router.js#L10-L18)

> Unlike most of the successive versions of the sample application in this book, the branch `chapter-12-01` does not work, it is just an intermediate step still incomplete.

It is easy to relate the array of routes under the `childRoutes` property, they are basically the same as we had before with some minor differences. The paths  lack the `.html` ending and the `pid` parameter is part of the route path instead of a query parameter, so it follows the standard where the item should be identified by the route itself while the query parameters are meant for options.  Also, in the earlier example, it was the `project.js` module the one that read the `pid`.  Here it is more like in Express, where the router picks it up from the route itself. Likewise, route matching is sequential within an array so the order is important.  

Routes in the client work somewhat different than in the server. In the server routes result in running some piece of script that sends a stream of HTML code, images, JSON data or any other sequential collection of bytes with a single call to `res.send()` or its variations. There is only one stream of data going out of the server.

Routes in the client are meant to affect a two-dimensional screen where each part of the route might influence a particular section of it.  For example, most web pages will have a standard look, starting with an enclosing frame with the basic color scheme, perhaps the company logo, a copyright sign and so on.  Within that frame there might be other standard sections such as a header or footer, perhaps a menu or tabbed interface and finally, there will be one or more sections that are totally dependent on the route.  For example, a mail-client program will have a main section that contains the list of folders for the `/`, a list of messages in the inbox for `/inbox` or a particular message for `/inbox/de305d54-75b4-431b-adb2-eb6b9e546014`.   Each responds to a fragment of the full URL and they all combine to build the full screen.

![email program layout](routes.png)

The image above shows how the different parts of the URL bring up different sections on the screen layout for such application, with each section dealing with a little bit more of the URL and enclosing the more specific section. That is why client-side routes are hierarchical and why our routes from the previous example are `childRoutes` within the root route. Each section is handled by a *component*. A typical application will handle more levels than this simple example, nesting many more components. Our router includes two components:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-01/client/router.js#L5-L6)

Our `Index` and `Project` components will be React versions of the former `index.js` and `project.js`, as we will soon see.  For our overall frame, responding to the `/` part of the path, we have an `App` component which is quite simple indeed:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-01/client/router.js#L8)

Basically, what it says is that the App frame, which will receive some `props` properties, most of them from the router and amongst them the `children` property, should just return whatever the children produce. Of course it usually is something more elaborate, some frame, logo or some such, but right now, this should suffice. We must have a single overarching frame, even if it does nothing more than enclosing any number of children because, after all, we only have one screen.

With the `indexRoute` option we are also telling the router that when no route is specified, the `Index` component should be shown.  In other words, we are defaulting to showing the `Index` component whether we explicitly ask for it with `/index` or not, very much like the regular `index.html` default.

## React Router

We are using [React Router](https://www.npmjs.com/package/react-router) which works along [React](https://facebook.github.io/react/) so we first have to install those.

```bash
npm i --save react react-dom react-router history
```

We install these with the `--save` option, not `--save-dev` because they are part of the production code, not just development tools, and so they go into the `dependencies` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-01/package.json#L33-L43) section of `package.json`. Besides React and React Router, we are installing `react-dom` which contains the parts of React specific to browsers as opposed to other possible environments such as smart-phones or future platforms, and `history` which complements the router by letting it manipulate the browser history and respond to the back and forward buttons (I don't know why the highlighter put that one in a different color, sorry).

We can then use those packages into our script:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-01/client/router.js#L1-L3)

The magic of Babel transpiling allows us to use both the new ES2015 `import` statement and the CommonJS `require` function.  The new `import` statement allows us to import whole packages such as `React` or just one or more named exports within a package such as `render` from `react-dom` or `Router` and `browserHistory` from `react-router` (actually, it is ES6 *destructuring* that lets us pick the pieces we want, more on that later).

With all these pieces, we must put this `routeConfig` to work:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-01/client/router.js#L20-L29)

We are asking React to `render` a new React element provided by `Router` into the `<div id="contents">` we have on our `index.html` page [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-01/public/index.html#L8).  The router will not be a visible DOM element itself, it is the components selected according to `routeConfig` that will produce the DOM elements we will eventually see in the web page. We provide this `Router` element with two configuration elements, the `routes` property points to the `routeConfig` we have defined and `history` pointing to `browserHistory` which is one of several history managers the router can use.  

History managers handle the locations the browser visits.  They listen to changes in the locations (i.e.: `window.location`), such as those seen in the address bar of the browser, and handle them on the client-side, without sending any actual request to the server. The `browserHistory` manager is the only one that is worth serious consideration in production.  It is not the default because it requires some support from the server.

Instead of the complex route we had to support our earlier primitive version of router [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-11-04/server/index.js#L20-L23) we now have a simpler, catch-all route in our Express server:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-01/server/index.js#L18-L22)

Thanks to our client-side router, our application will be able to respond to several *virtual* URLs which don't actually exist on the server side.  At any time, the user might save one of those URLs or copy and paste them into an e-mail to pass them on to someone else.  What happens when any of those URLs are requested?  If the user had started the application from the home page, all routing would be handled by the client but if, out of the blue, the user requests one of those virtual URLs, the request will go straight to the server, but there is no actual file there to be sent back to the user. That is why we have to add this route, we are letting the client app to handle those virtual routes.  As a rule, wildcard, catch-all routes should go at the end, after all other routes have been dealt with.

So far, if the URL requested was for any of the known paths such as `/data/v1/projects` there was a piece of script to handle it, otherwise it felt through and got to that `express.static` middleware which tried to find a file that mapped to the requested path.  Then, if no file was found, it would let the request fall through by calling the `next()` callback.  If that was the end of the list of routes  and route patterns (which it was) Express, having nowhere else to look for, sends a `404 Not Found` reply. If there had been any further routes or patterns, Express would try them as well before quiting.

The wildcard `'*'` route we add means that for absolutely any leftover route the file `/public/index.html` will be sent.  That will load and run our application and then the client-side router will deal with that route.

This also means that our client-side App must deal with the 404 Not found condition on its own because the server will never send that error on its own. We may do this by adding a wildcard route at the end of the child routes:

```js
childRoutes: [
  { path: 'index', component: Index },
  { path: 'project/:pid', component: Project },
  { path: '*', component: NotFound }
]
```

Since the routes are matched in sequence, the last wildcard catches any route that failed to match and it shows the `NotFound` component, which is simply declared like this:

```js
const NotFound = () => (<h1>Not found</h1>);
```

That line of JavaScript doesn't look right, does it? The `<h1>Not found</h1>` part should be quoted or something since it is not JavaScript but HTML. Any linter would signal it as an error and Babel would not be able to transpile it as we have configured it so far.   Actually, that is JSX and we will use it more extensively.

## JSX

[JSX](https://facebook.github.io/jsx/) is an extension to JavaScript designed by Facebook to embed HTML into plain JavaScript.  It is not a proposal for future JavaScript versions nor it is meant to be included in any browser but to be transpiled.

> If I may take a moment to brag about it, back towards the end of 2008 I made a proposal to embed HTML into PHP. I called it [PHT](http://www.satyam.com.ar/pht/) which resulted from a merger of the letters in PHp and HTml.  It was an extension to the [PHP Compiler](http://phpcompiler.org/) which could generate native code but could also serve as a transpiler.  I used is as a transpiler to create regular PHP out of PHT code.  Mechanisms to publish and make open source contributions back then were not widely available, no GitHub or any such popular sharing mechanisms, so the idea faded away.

JSX is based on the fact that the less-than sign `<` is a binary operator in JavaScript so it should be found in between expressions to be compared and it could not possibly be found at the start of an expression.  The JSX transpiler catches those unary `<` and takes care of dealing with what follows. If we are not sure whether the transpiler would consider a `<` to be a *less than* operator or JSX, we just open a parenthesis right before it, like in `(<h1> ...)` because that ensures the start of a new expression.

None of our code lints or compiles as it is.  We need some extras to deal with JSX:

```bash
npm i --save-dev babel-preset-react eslint-config-airbnb eslint-plugin-react
```

We are installing a whole bunch of Babel extensions which are encompassed into a preset collection called `babel-preset-react`.  We need to tell Babel to use that preset by modifying our `.babelrc` file:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/.babelrc)

Babel assumes the `babel-preset-` prefix to the names listed in the `presets` entry.

We are also loading a new ESLint plugin to handle React, which uses JSX extensively and a rules configuration file `eslint-config-airbnb`, which is the standard set of routes used by the [Airbnb](https://www.airbnb.com/) development team.   We are making use of a nice feature of ESLint which is that we can use different preset configurations in different folders.  We will be still using the `eslint-config-standard` presets for the server-side code, as we've been doing so far, but will use the Airbnb ones for our client side code.  To do that we simply add a `.eslintrc.json` file in the `/client` folder:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/client/.eslintrc.json)

The rules are extensively explained and, when not purely stylistic, thoroughly justified in their [GitHub repository](https://github.com/airbnb/javascript).  For the purpose of this book, it is just interesting to note that two teams, working in different environments, one in the server using native NodeJS with no transpiling, the other on the client with Babel, can use different styles and rules suited to their environment.

We can use JSX far more extensively.  All our routes can be expressed in JSX:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/client/router.js#L11-L20)

We have already seen that to embed JSX we just need to start an expression with a `<`.  We can also embed plain JavaScript into JSX by enclosing any expression in curly brackets.  We do that with `{App}`, `{Index}`, `{Project}`, `{NotFound}` or `{browserHistory}`, which are either `const`ants declared in JavaScript or imported modules.  Any sort of expression can thus be embedded, very much like we do in ES6 template strings by enclosing variable parts in `${ }`.

The React plugin for Babel creates plain JavaScript for all that JSX, it turns them into calls to `React.createElement`, in other words, it would transpile it into something pretty much like the code we had before [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-01/client/router.js#L10-L29).  Some of these elements are plain HTML others are React components.  To tell them apart, HTML elements should be all lowercase, `<h1>` or `<div>` while React components should start with uppercase `<Router>` or `<IndexRoute>`.  That is why we changed our `index` and `project` references into `Index` and `Project`.

This is how our previous `index.js` might look using JSX for React:

```js
import React from 'react';
import { Link } from 'react-router';
const data = require('./data.js');

export default () => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      Object.keys(data).map(pid =>
        (<li key={pid}>
          <Link to={`project/${pid}`}>
            {data[pid].name}
          </Link>
        </li>)
      )
    }</ul>
  </div>
);
```

This is called a *stateless* component in React.  It is simply a *fat arrow* function that returns whatever needs to be displayed. That function is our default export. Our earlier `App` and `NotFound` components were simple stateless components.  There are *stateful* components as well, which we will see later.

We are importing `data.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/client/data.js) which is the same `data.json` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-06-01/server/data.json) turned into a module, so that we don't need to interact with the server. We will do that in later chapters.  Note how we can mix ES6 `import` statement with CommonJS `require` in the same module. It is safe to use `import` with those modules that were exported using ES6 `export` statement and `require` with those exported by assigning to the `module.exports` property, the other combinations are not straightforward.

Besides plain HTML elements, we are using the `<Link>` component from `react-router`.  This component renders as a plain `<a>` element but it is tied internally to the router so the link will not be actually followed but caught by the router and processed so as to activate the corresponding component.

There is also a `key` attribute added to each `<li>` element.  This is an optimization for React.  Whenever there is a repeated element such as the list elements within a `<ul>` it helps if we provide React with a unique id to tell them apart.  It helps it optimize the screen refresh specially when items are added or removed.

We can improve on this component by separating it into the list and the items:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/client/index.js)

The `ProjectItem` component displays a single project item in the list.  We use it within the loop in the project list by using it as a JSX component `<ProjectItem>` and providing it with what look like HTML attributes, `pid` and `name`.

The `ProjectItem` component receives a *properties* argument, usually referred to as `props`, which is an object containing all pseudo-HTML-attributes used when invoked.  Here we are using ES6 [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) to explicitly assign the relevant properties within the `props` object into variables that might well be considered function arguments.  The following segments of code are equivalent:

```js
const ProjectItem = ({ pid, name }) => (
// --------------------
const ProjectItem = props => {
  let {pid, name} = props;
}
// -----------------
const ProjectItem = props => {
  let pid = props.pid;
  let name = props.name;
}
```

Destructuring is new to JavaScript in ES6, it is not JSX nor React. We have already used *destructuring* in the `import` statements.

As a general rule, it is customary to add a `className` attribute to the outermost element in each component, derived from the name of the component itself. Thus, for `ProjectItem` we have `project-item`, for `Task`, `task`, each following the standard naming conventions of the language. However, there is nothing but custom preventing us from using `ProjectItem` as a class name and we might as well have done so. Since `class` is a reserved word in JavaScript and JSX allows us to mix JavaScript and HTML, it is not good to use `class` as the HTML attribute name, thus, we must use `className` instead.  Likewise, in `<label>` elements, instead of `for` as we must use `htmlFor`.

The Router component uses properties to send information to the components.  We use that in `project.js` which should read the `pid` from the route. Just as Express does on the server-side, Router also provides a `params` object with the decoded parameters which we can then retrieve from the `props` argument using, once again, *destructuring*:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/client/project.js#L27-L34)


### PropTypes

React provides us with a mechanism to validate the nature of properties passed to components.  We can declare the data types of those properties by adding a  `propTypes` static object to our components.  React has two modes of operation, production and development.  In development mode, the default, it will check a good number of things and issue warnings to help us pinpoint any problems ahead of time.  It will skip on this checks when running in production mode. Thus, we can add property validation at no performance cost to us.

For the above `ProjectItem` component we can add the following property validation:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/client/index.js#L13-L16)

React provides a good number of [PropTypes](https://facebook.github.io/react/docs/reusable-components.html#prop-validation) to check the properties of any component.  We have used `string` as the data type for `pid` because object property names are always converted to strings even when they originally were numbers.  The optional `isRequired` can be added to any other data type to make it mandatory.  

### Production version

To create the *production* version to be deployed in a real life installation we need to create a new configuration file `webpack.production.config.js` for WebPack.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/webpack.production.config.js)

We are using the original configuration file `webpack.config.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/webpack.config.js) as the basis and adding one of WebPack's built-in plugins that allows us to add environment variables to the task.  To run it we add another command to our `package.json` file:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/package.json#L13)

So, if we do `npm run production` we will run WebPack with the new configuration file and also with the `-p` or *production* option which produces a minimized version with all comments and formatting stripped off.

When we run this NPM script, we will get hundreds of warning messages mostly produced by [Uglify](https://www.npmjs.com/package/uglify-js) saying `Condition always false` or `Dropping unreachable code` in many locations.  This is because React has plenty of pieces of code to validate and verify the workings of the components we write while in development, each enclosed in a conditional such as:

```js
if (process.env.NODE_ENV !== 'production') {
```

Since we have set `NODE_ENV` to `production` all those pieces of code will not be included in the output, which is good. We will drop those warnings later on but it is good to see them once to appreciate how much code React has to keep us safe.

Our code not only runs faster but after being minified and stripped of all unnecessary code, our `bundle.js` file has gone down from about 930kB to less than 200kB, almost a fifth in size.

WebPack also has a `-d` option for development, which produces a *SourceMap* which cross-references the output code in the bundle to the original code and helps in debugging.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/package.json#L11)

### Watch for changes

While doing all these changes, we start getting bored of typing the `npm run build` command after every single change.  We can simplify this by using WebPack's *watch* feature with the following extra NPM script command:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/package.json#L12)

Running WebPack with the `--watch` option tells it to keep an eye on all the dependencies that make up the bundle.  If any of them change, WebPack will automatically rebuild the bundle.  By adding the `&` at the end, we leave it to run in the background, freeing us to do `npm start` to start the web server. We do this only for the development version since that is the one we will be changing continuously.  

### Final touches

The `import` statement allows us to import both the whole module at once and specific named exports within it:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-03/client/index.js#L1)

Here we are importing `React` wholesale as we've been doing so far but also importing `PropTypes` as a separate named import.  This makes it shorter for us when declaring the property types:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-03/client/index.js#L13-L16)

We are also exporting `ProjectItem` as a separate named export (in contrast to the default export which is `ProjectList`).  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-03/client/index.js#L5)

Adding that named export doesn't affect our use of the main component, which is the default export, while it allows us to run separate tests on `PrjItem`.  It is a good practice to provide direct access via named exports to the subcomponents within a module for testing.

Finally, we have added a configuration option to our `webpack.production.config.js`  [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-03/webpack.production.config.js) so it will not print those hundreds of warning messages when generating the production version.

## Summary

We have modified our basic application to run on React, JSX and React Router.
