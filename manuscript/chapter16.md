# Tools and helpers

With abstractions such as React and Redux, it gets hard to figure out what is actually happening when something goes wrong using a regular JavaSript debugger.  That is when we most need debugging tools.  There are developer tools available for both.

## React Developer Tools

Available for [Google Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/) it adds a `React` tab to the debugging pane which allows us to see the rendered components, their properties and the state of stateful components. If a component has references to DOM elements, the [ref](https://facebook.github.io/react/docs/more-about-refs.html) pseudo-attribute, it will also list those.

For the components that have declared their intent to access the context it will show it. Redux data containers access the store via the context so it will show it, however, it will not show the state, since it is not public, only the public methods, which are not helpful at all.  For that, we need the following:

## Redux Dev Tools

We can install [redux-devtools](https://www.npmjs.com/package/redux-devtools) as usual:

```bash
npm i -save-dev redux-devtools
```

We then have a couple of options.  There is a set of NPM modules that we can install to create our own interface on any browser.  However, life is much simpler if we use the add-on for [Google Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) which will simply add another tab to our debugging pane and requires just a very small change to our code.  When creating the store, instead of

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-02/client/store/createStore.js#L9-L11)

we must do:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-01/client/store/createStore.js#L9-L14):

Back in [chapter 12](#chapter12-production-version) we defined a production configuration for WebPack, `webpack.production.config.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-02/webpack.production.config.js).  In it, we defined a global `process.env.NODE_ENV` variable set to `'production'`.  React uses that variable to drop large pieces of its code that are great for development but only hurt performance when in production.  We are using the same trick here. By checking we are not in production mode, we only load the extension when needed and if it is available.

The Redux tab will show each action as it happens along its payload and the state of the store as it changes.  It also lets us reset the store to its initial state or step back.

The NPM versions requires a more involved setup but it has various loggers that offer several alternatives, such as logging just actions of a certain type or dispatching actions at will.  Here we have further reasons **not** to use `Symbol()` for action types.  Though Redux allows it and we would be able to see them logged, we wouldn't be able to set a filter on them or dispatch such types.

## React Performance tools

It is never a good idea to start thinking about performance until we have a solid application up and running, however, since we are listing debugging tools, we should mention React's own performance tool  [react-addons-perf](https://facebook.github.io/react/docs/perf.html).

As with all packages, it has to be loaded:

```
npm i --save-dev react-addons-perf
```

React add-ons are still distributed along the main React package thus all the `react-addon-xxxx` modules are just stubs to reach the already existing module and it still possible to do so, plenty of articles out there still describe this, however this is discouraged since it will not be so in the future. We will do it the now standard way:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-01/client/index.js#L6-L8)

Once again we check the *environment* to ensure the performance add-on will never be added in the production version.

We had to add a comment for ESLint to allow the use of `require` within a conditional.  ESLint is giving us good advise. Since WebPack does a static analysis of the source code looking for `import` and `require` statements it packages everything into the bundle. WebPack cannot evaluate conditionals thus it includes everything, just in case. That is why ESLint warns us, we might believe we are doing some conditional loading but, in reality, we are bloating the bundle with all the external modules from the start. However, the above conditional compares two constants and doesn't depend on execution.  [Uglify-JS](https://www.npmjs.com/package/uglify-js), the JavaScript minifier, does analyze these static conditionals and will drop the code above. The loaded module, not being referenced from anywhere, will also be dropped, even after WebPack has placed it in the bundle. Thus, we can tell ESLint that it is fine to do that here.

We save the `Perf` object globally in order to make it available everywhere in the application, even right from the browser's debugging console.

When we want to check the performance of a part of our application, we call `Perf.start()`. We can type that command right into the debugger console.  When we reach the end of the section we wanted to test, we call `Perf.end()`.

At that point, we have several commands available, all of which print right into the browser console.  The most useful of those is [`Perf.printWasted()`](https://facebook.github.io/react/docs/perf.html#perf.printwastedmeasurements).  With luck, it will print an empty Array, otherwise, it will show a listing of those components that were called to render, but produced no changes in the DOM so they were a waste of time.

All times shown in all the print commands are relative values. When in development mode, React is much slower than in production mode.  If a generic performance measurement tool is used, we would see that validating the component's `props` via the `propTypes` object takes an inordinate amount of time.  This nor the collection of performance information happens in production mode where the times are much lower.

## WebPack warnings

When generating the production version via `npm run production`, WebPack will produce pages and pages of warnings.  This might be interesting so we can actually see how much of React validation code is dropped in the production version. We can also see how our own load of `react-addons-perf` gets dropped in production mode.  However, it really isn't very helpful so we might want to drop it.  To do that, we need to turn warnings off by adding the following to the configuration file:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-01/webpack.production.config.js#L10-L14)

The Uglify plugin is automatically added when WebPack is run with the `-p` option but to change the default options for the uglifier (that is, the minifier, which produces a small but *ugly* version of our script), we need to declare it explicitly.

## UI components

We don't really need to start the graphic design of our pages from scratch, there are a good number of UI components available. Some libraries offer single individual components, but others offer comprehensive sets of the most often used components with a consistent look and feel derived from well known UI libraries, such as Twitter's [Bootstrap](http://react-bootstrap.github.io/), Google's [Material Design](http://www.material-ui.com/#/) or Thinkmill's [Elemental](http://elemental-ui.com/), all ported to React.

All these libraries contain not only simple stateless components to produce nicely styled UI elements (though that makes a large part of it) but also complex stateful components such as dropdown menus.  We will not use any of those libraries in the example in this book to avoid confusion in between what our code does and what the imported style library does.  

## Flux Standard Actions

Actions must have a `type` property but the rest is left for us to determine. We have created our actions much like standard DOM event objects, where all the information is flat at the top of the object.  However, the action object is clearly split in between the mandatory `type` and a payload, which is what the resolver acts upon.  

It makes sense to formalize this split and also standardize some other possible contents. That is what the [Flux Standard Action](https://github.com/acdlite/flux-standard-action) does.  The FSA action object will always contain the mandatory `type` property and usually will contain a `payload` property which is an object with the associated data.  It may also contain `error` and `meta` properties. There are several [libraries](https://github.com/acdlite/flux-standard-action#libraries) that help in handling FSA actions.

This is particularly useful when dealing with remote servers.  It is often the case that the data associated with the action must be sent to the server. It is easier if all this data is under a single property `payload` that can be passed on verbatim rather than having to filter `type` out of the action object.  Also, by having all our data under `payload` we are free to have a piece of data called `type` without conflicting with the action `type`.

Since remote operations are also subject to all sorts of potential exceptional conditions, it is also good to have a standard place to put any error information within the action object, hence the optional `error` property.

## Navigating

We have used the `<Link>` component from React-Router to let the user navigate, but what happens when we want to navigate from our code?

Components which are direct descendants of a `<Route>` already receive as properties the `router` object which provides several [navigation methods](https://github.com/reactjs/react-router/blob/master/docs/API.md#pushpathorloc).  We could simply navigate to the root by doing:

```js
this.props.router.push('/')
```

However, those components that are further down away from `<Route>` have no access to these methods unless the intermediate components trouble themselves passing `router` down.   To make them available to any component, React-Router provides a Higher-order Component or *HoC* in React parlance.  We have already used a HoC, the `connect` method of React-Redux is, in fact, a HoC.  

We will make a contrived example to show how to use it by modifying the `NotFound` component. We won't be committing this version to GitHub.  Since `NotFound` is a direct child of a `<Route>`, it already has access to `router` but lets imagine it doesn't.  We will add a simple link to let the user go back to wherever it was before getting there.


```js
import React, { PropTypes } from 'react';
import { withRouter, routerShape } from 'react-router';

const NotFound = props => {
  const onClickHandler = ev => {
    ev.preventDefault();
    props.router.goBack();
  };
  return (
    <div>
      <h1>Not found</h1>
      <p>Path: <code>{props.location.pathname}</code></p>
      <a href="#" onClick={onClickHandler}>Go Back</a>
    </div>
  );
};

NotFound.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
  router: routerShape,
};

export default withRouter(NotFound);
```

In the code line right above we are wrapping the `NotFound` component with `withRouter` right before exporting it.  We imported `withRouter` from `react-router`.  Once wrapped, `NotFound` will receive an extra property `router`.  To get it validated we must declare it in `NotFound.propTypes` using `routerShape` as its descriptor which React-Router also provides. We could have validated it as a simple `React.PropTypes.object` but it wouldn't validate its contents.

We changed the stateless component to respond to an `onClick` event on an `<a>` element we've added.  The `onClickHandler` first prevents the default action and, instead, uses `props.router.goBack()` to navigate back.

## Class Names

Creating class names dynamically leads to some ugly and complicated code:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-02/client/components/projects/task.js#L16)

The [`classnames`](https://www.npmjs.com/package/classnames) package greatly simplifies those expressions by allowing us to combine any number of class names, some of them conditional, and produce a single string.  We then could have written:

```js
className={ classnames('task', { completed, pending: !completed })) }
```

`classnames` takes any number of arguments. If an argument is a string, it concatenates into the output string. If it is an object, it loops through it and adds the property names of those whose values evaluate to true.  Thus, in the case above, it will always include `'task'` and will add `'completed'` if `completed` is true and `'pending'` if not.

React-Router also lets us play with some class names.  The `<Link>` component has an `activeClassName` property that can be set to any string. If the current URL of the page either starts with or matches (when `onlyActiveOnIndex` is true) the location this link is pointing to, `<Link>` will add the value of the `activeClassName` value to its `className` attribute.  This is meant to highlight the link when the location it points to is active, for example, in menus, to highlight the chosen option, or the active tab on a tabbed interface.  We can use it in `ProjectItem` to show the active project.  We can reduce the code from this:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-02/client/components/projects/projectItem.js#L4-L16)

To this:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-01/client/components/projects/projectItem.js#L4-L13)

The `disguise-link` className simply hides the visual clues of the link so it doesn't show as such [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-01/public/index.css#L17-L22).  The link would still work, though it would produce no visible effect since it is already there, but with the link disguised there is little reason for the user to click on it.  

We can prevent the navigation by listening to the `onClick` event and checking whether the route this link points to is the one active right now and preventing the default action if it is.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-02/client/components/projects/projectItem.js#L9-L13)

To use `router.isActive` we have to use the `withRouter` HoC as described in the previous section.

Since the `active` property is no longer needed, we dropped both in `ProjectItem` and also in `ProjectList` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-02/client/components/projects/projectList.js) where it was being generated.

Now comes the bad news.  Our application no longer works right.  If we run the application at this point and click on the projects to switch from one another, something funny happens.  The pane below changes to reflect the project just selected, but the link we've just clicked remains as a link.  The problem is that in the previous version, by passing the `pending` property from `ProjectList`, which changed with each route, React detected that change in properties and re-rendered `ProjectItem`.  Now, with no change in the properties, React is not aware that anything has changed.

If we check on any of the tasks, suddenly, the links in the list of projects get updated.  That is because the `pending` count has changed and `connect` has detected that change and ordered a refresh.

Part of the problem is that most of our components use `connect` to subscribe to changes in the store and change accordingly but the location information is not saved in the store so, when the location changes, components are not notified.

There is a further problem with not saving the location information in the store, the snapshots that the *undo* and *redo* operations require would be incomplete. We would be able to update the screen to reflect the state of the store at any point, but the URL displayed in the address bar of the browser would remain unchanged, not reflecting what is being shown.

## react-router-redux

This package allows us to store the location information in the store so it can be restored from any snapshot.

Setting up 'react-router-redux' is just a matter of following a series of recipes which are of little interest to us.  They would make sense if we got deep down into the technical details of it, but it is beyond the scope of this book.  

We can see those changes in the following comparison in between versions [(:octocat:)](https://github.com/Satyam/book-react-redux/compare/chapter-16-02...chapter-16-03).  As usual, the lines on a light green background are additions, the ones in red are deletions.

Using the Redux Developer Tools we installed earlier, we can see the effect of changing location on the store.  Our store now has two sub-stores, `projects` and `routing`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/createStore.js#L6-L9)

When creating the store we are combining our reducer with the `routerReducer` that `react-router-redux`, which handles the `routing` sub-store.  That is what the developer tools show.

They also show something else, there is a `@@router/LOCATION_CHANGE` action with is the one that produces the changes in the store.  We can dispatch those same actions from our code or, even easier, we can use the [action creators](https://github.com/reactjs/react-router-redux#pushlocation-replacelocation-gonumber-goback-goforward) that `react-router-redux` provides.  Anywhere in our code we can include and use all or any of them:

```js
import { push, replace, go, goBack, goForward } from 'react-router-redux';
```

As with any action creator, we may use them with `store.dispatch` or, in a connected component within `mapDispatchToProps`.  For example, in response to a *Cancel* button, we might want to go back to the previous page:

```js
import { goBack } from 'react-router-redux';

export const mapDispatchToProps = dispatch => ({
  cancelButtonHandler: () => dispatch(goBack())
});
```

To have those action creators available along the rest, we might re-export them in `client/store/actions.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/actions.js) along our own action creators.


```js
export * from './projects';
export { push, replace, go, goBack, goForward } from 'react-router-redux';
```

We will use some of these action creators further on.

## Memoizing (caching)

In a component wrapped by the `connect` HoC from `react-redux`, some of the properties that `mapStateToProps` calculates might be expensive to produce.  If the values they are based upon have not changed, it is not worth repeating the process.

The [reselect](https://www.npmjs.com/package/reselect) package allows us to compare the new values the calculation depends on with their previous values and if they match, `reselect` returns the previous values, not bothering to perform the calculation.

For example, we could produce the `pending` count not in the store but in `ProjectItem` itself [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/components/projects/projectItem.js#L29).  Our current version simply returns the pre-calculated value from the store [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/projects/reducer.js#L21-L22). It is less expensive to do it in the reducer because it will only be re-calculated when an action triggers the change.

If we did it in `mapStateToProps`, the value would be re-calculated more frequently, for example, whenever we switch from one project to the other, the issue we fixed a few sections earlier (when the `<Link>` and its `activeClassName` wasn't working).  Moreover, we would have to do the full computation as we did in the initialization:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/projects/reducer.js#L8-L12)

This would be expensive and pointless.  In the end, `connect` might figure out that the value of `pending` hadn't changed and skip the refresh.

The `reselect` package would have allowed us to check whether the tasks had changed and re-calculate only if they did.  We must remember that if we use an immutable store, as we should and did, checking whether the `tasks` object has changed means comparing the new and previous references to the `tasks` object, which is fast, not looping through its contents which would be just as bad as doing the calculation itself.

However, using `reselect` with multiple instances of the same component is somewhat complicated as explained [in the docs](https://www.npmjs.com/package/reselect#accessing-react-props-in-selectors) so we won't do it.

Each selector that `createSelector` creates stores a copy of the values to be checked for changes.  If we use `createSelector` in `ProjectItem` to create one selector, that selector would store the values for the first project in the list.  When the second project is shown, the selector would correctly find out that it is not the same and redo the calculation instead of using its cached value and it would keep doing so for each project.  If the list of projects is refreshed again, the selector would re-calculate each and everyone since the values it has stored are those for the last project in the list.  To solve this we would need to create a selector for each project, possibly a hash of selectors indexed by `pid`.

## Reducing Boilerplate

The Redux documentation contains a section on [Reducing Boilerplate](http://redux.js.org/docs/recipes/ReducingBoilerplate.html).

So far we only have only one action creator:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/projects/actions.js)

As we go ahead with our application the number of such action creators will grow.  To avoid the repetition, we might use a function such as that shown in the documentation for Redux:

```js
function makeActionCreator(type, ...argNames) {
  return function(...args) {
    let action = { type }
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index]
    })
    return action
  }
}
```

If we did so, our previous action creator would be reduced to:

```js
export const TASK_COMPLETED_CHANGE = 'projects/Task completed changed';

export const completedChanged = makeActionCreator(TASK_COMPLETED_CHANGE, pid, tid, completed);
```

Redux does not provide such a function natively because should we decide to use the [Flux Standard Action](https://github.com/acdlite/flux-standard-action) format or any other, our `makeActionCreator` function would have to change.  Just as with all of Redux excellent documentation, that is a chapter worth reading.

## Summary

We have checked on various tools, utilities and tricks that can help us in developing an application:

* React Development Tools
* Redux Development Tools
* React Performance Tools
* Disabling WebPack warnings when generating the production version
* UI Component libraries we might use
* Alternative formats for Redux actions, such as FSA
* How to handle navigation with `redux-router` using `withRouter`
* How to simplify assembling classNames with `classnames`
* How to save the location into the store with `react-router-redux`
* How to cache calculated values with `reselect`
* Tips on reducing boilerplate
