# Routing

We are using [React-Router](https://www.npmjs.com/package/react-router) for our client-side routing, coupled with [react-router-redux](https://www.npmjs.com/package/react-router-redux) to navigate by dispatching regular Redux actions and keep the store in sync with the location information.

Instead of having a single file holding routing information for the whole application, we have spread the responsibility to each of its parts, in this example, the only one we have, *Projects*.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/index.jsx)

React routes can also be written using JSX because each `Route` is a React Component.  For each route the router matches the `path` of the URL with the `component` that then gets called.  Just like in server-side Express routes, the colon precedes variable parts that will be turned into named parameters, in this case `:pid`.  The component will receive this parameter as one more property as `props.params.pid`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/project.jsx#L51-L52)

Routes can be nested. The outermost route receives its path from the parent, so as to consolidate the assignment of paths in one place, thus avoiding possible clashes. Assuming the parent passes `projects` for `path`, all this section of our app would be contained under the `/projects` path, for example `/projects`, `/projects/newProject`, `/projects/editProject/25` or `/projects/25`.  Note that, unlike Express routes, all components that match part of a route are called, not just the first match.  Thus, for `/projects/25` both the `ProjectList` and the `Project` components will be called with `Project` being embedded wherever the `{children}` placeholder [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/projectList.jsx#L39) within `ProjectList` says.

The same `EditProject` serves both to add a new project as well as for editing an existing one, the difference being that when editing, the `pid` parameter will not be null.

## Routing file structure

React-Router doesn't force any particular file structure as to where and how its routes are declared.  Many applications have just one big master routing file.  We prefer to delegate routing to each of the parts of the application.

The set of routes above serves only the *Projects* part of what could be a more complex application. Note that the import paths to all the components point to files in the very same folder. It is all self-contained.  The set of routes is the default export in `index.jsx`, which is the default file name/extension for file imports.  Thus, when higher up in the hierarchy we write:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/index.jsx#L7)

we are actually importing the routing information to branch off to each of our components depending on the URL.  As a matter of fact, the whole of the parent routing file has a very similar structure:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/index.jsx)

All file import paths point to files (`./app`, `./notFound`) or folders (`./projects`) in the very same folder it resides.  The routes are the default export and the file is the default filename with the default extension.

The path for the root component in this file is received as an argument from the parent. In our case, that root path is `/` but the whole application could easily be moved elsewhere.  It calls the `App` component, which is the overall frame that encloses the whole application.  The `*` path, which is a wild-card, catches any path that doesn't match any route, thus it shows the `NotFound` component.

Nested under the route for `/`, we have `{projects('projects')}` which brings the routes for the *Projects* part of the application and tells it which path it should respond to.  Should there be other parts, as a normal application would certainly have, they would be added here as well, each receiving its own unique root path.

Going further up we get to the entry point for the client-side application. We will come back to this file later on, as there are a few other things we need to look at before dealing with the rest of it.  As for the routing part, this is what we care about:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/index.jsx#L31-L39)

To get our React app going, we call the `render` function imported from `react-dom` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/index.jsx#L2) and tell it which React component to render and the DOM element render it in.  Here we are using two React Components that are not visible:

* `Provider` comes from React-Redux and it is the means it uses to make the `store` available to all the components in the application.  The `connect` HoC we have used [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/projectItem.jsx#L29-L33) to make our components aware of the store takes it from `Provider`.
* `Router` (note the spelling, `Router`, not `Route`) is the one actually managing the routes configured below.  It also provides the `withRouter` HoC. It receives a reference to the `history` to use.

Finally, the `{components('/')}` embeds the routes from our application right at the root URL path.

Client-side navigation can be done via [`window.history`](https://developer.mozilla.org/en-US/docs/Web/API/Window/history), however, different implementations on various browsers makes it impractical to handle it directly.  The [`history`](https://www.npmjs.com/package/history) package provides a uniform mechanism across all browsers.   React-Router adds a further layer on it an offers [three varieties](https://github.com/reactjs/react-router/blob/latest/docs/guides/Histories.md#histories). We will use the recommended one, `browserHistory`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/index.jsx#L3-L4)

We add a further layer upon it through `syncHistoryWithStore` which enables the state of the browser history to be reflected in the store:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/index.jsx#L25)

It is that store-synched `browserHistory` which we tell `<Router>` to use.
