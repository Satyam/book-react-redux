# Reducers

Actions don't directly change the Store, they are just notifications that an operation is requested.  The Store is handled by Reducers. Though there is just one store, there can be any number of reducers, each responsible for handling a particular part of that store.  All reducers receive all actions, it is up to each reducer to decide whether it cares about it or not.  If it does, it updates the Store.

Now that we reach the final, missing element of the Redux architecture, we can trace the workings of an update of a task.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/task.jsx#L19)

The `Task` component has a couple of buttons associated to each item, one to delete the task, one to edit it.  The edit button has the `onTaskEditHandler` event listener attached.  Though it follows the naming pattern that `bindHandlers` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/utils/bindHandlers.js) expects, since `Task` is a stateless component, there is no `this` to bind it to but, nevertheless, it never hurts to stick to standard naming practices.

After checking that the button received a plain click, `onTaskEditHandler` calls `onTaskEdit` with the `pid` and `tid` of the task that needs editing. `onTaskEdit` is a property of `Task`, produced by `mapDispatchToProps` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/task.jsx#L81-L86) which simply dispatches an action:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/task.jsx#L84)

The `setEditTid` action creator uses just the `tid` since they are globally unique identifiers so the `pid` is not needed to identify the task.  `setEditTid` can either receive the `tid` of the task to be edited or `null` or `undefined` to edit no task.

A Redux store can hold application data, such as the projects and tasks our application deals with, but also status information about, for example, pending HTTP requests or, in this case, miscellaneous information such as which task needs editing, if any.  That is why we placed this single status information into a catch all sub-store called simply `misc` contained in a single `index.js` file in its folder.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/misc/index.js)

We first declare the `EDIT_TID` action type as a string.  As with all action types, to ensure (or at least to try to reach) uniqueness, we prefix the string with the folder it resides in.

We then declare the `setEditTid` action creator function, which we already used in `Task`.  It simply returns an object with the `EDIT_TID` action type and the `tid`.  Being such a simple action, we did not bother using the FSA format. We export `setEditTid` so others can dispatch it.

Finally, we get to the reducer.  While a single file may have several action type constants and action creators, which we export by name, a file should only have one reducer, which we make the default export.

The reducer receives two arguments, the action and the current state of the store.  The action will always be a simple object. Even if we dispatched a function like we do when using `asyncActionCreator` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/utils/asyncActionCreator.js), those functiond will never reach the reducer, they will be handled by middleware earlier on. By the time they reach the reducer, all that is left are plain literal objects.

If the reducer receives no `state`, it means it has yet to be initialized.  We use ES6 *default parameter values* feature to set `state` to `{ editTid: null }`. We must remember that this is the initial state of a part of the Store a sub-store, if you wish, other reducers will set their sub-stores.  Since this sub-store is named `misc`, this initialization means that the object `{misc: { editTid: null }}` will be merged with the objects returned by the other reducers on initialization.

We now have an existing or just initialized state and an action.  The reducer then checks the action type and if it is one it cares about, it updates the state of the store.  Otherwise, the `default` in the `switch` statement simply returns the `state` as it was received.  It is important to always return the `state`, updated or not, because whatever gets returned will be merged into the store and if we forget to return a valid `state`, we would just wipe out the sub-store.

It is important to handle the default case because all reducers receive all the actions sent by any part of the application, even if they don't care about it.  Reducers don't register themselves to handle specific action types, they all receive them all and each decides what to handle and what to leave alone.

If the action type is `EDIT_TID` then we update the `state`, with an expression that seems too complicated.  That is because of *immutability*.

## Immutability

Deciding when to re-render the page is one of the factors that most affects an application performance.  Since the page mainly reflects the state of the store, detecting when the state has changed is crucial. Comparing two objects with a plain equals `obj1 === obj2` simply says whether the variables `obj1` and `obj2` point to the same object or different ones. This is called a shallow compare. However, a deep compare might detect that two different objects contain the same information, that is the same structure and the same values, though a shallow compare would rightfully say they are not the same.  Doing a deep compare, that is, traverse the whole structure comparing the values for each of the properties would be very expensive.

The solution is to keep the objects in the store immutable, that is, never change the object but make a new copy with each change. This is nothing new, in JavaScript, strings are immutable, a string is never changed, updates on a string return a new string with the change in it. However, a deep copy is just as expensive as a deep compare or possibly more. In normal operation there would be more compares than copies and thus wasting time in doing one deep copy might pay off if it saves on doing several deep compares.

There is a nice way to greatly improve the performance of a copy. In a deeply nested object, we can create anew the parts of the tree that have changed and just do a shallow copy of the branches of the tree that have not changed, that is, copy the reference to the unmodified original branch. In our previous code, if we are going to change the value of the `editTid` property in the `misc` branch, we don't need to touch other branches such as `projects`.  We make a new object with a new `misc` property containing the `editTid` property and its new value, but we just do a shallow copy Of the `projects` branch.

The React team has provided us with a tool to do that, the [update add-on](https://facebook.github.io/react/docs/update.html) which takes the current state and returns a new state with the updated parts plus the references to the unchanged parts copied over.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/misc/index.js#L15)

`update` takes the current state and an object that represents just the parts we mean to change.  We don't need to enumerate the parts that will remain the same, whatever else `state` might contain, it will be shallow-copied to the new state.  The object in the second argument helps locate the part to be changed and then `update` provides several [commands](https://facebook.github.io/react/docs/update.html#available-commands) to tell it what to do. All commands start with the `$` sign: `$set`, `$apply`, `$push`, `$unshift`, `$splice` and `$merge`.  More than one command can be executed at once over different parts of the state.

Here, we are asking to have the `editTid` property within the sub-store that `misc` manages, set to the value of `action.tid`.  We immediately return the new state returned by `update` to Redux for it to merge it with the other sub-stores.

With this mechanism for updating the state, we can now simply compare the states with a shallow compare (`state1 === state2`) because, if there were no changes, the references would be the same.  We can do that at the root level of the store or at any level below.

Facebook also mentions [Immutable-js](https://facebook.github.io/immutable-js/) as an alternative.  Using Immutable requires the whole application to be aware of it, all our `mapStateToProps` as well as all our loops over arrays would need to be changed, thus, for the purpose of this book, we prefer to keep it simple.  `update` works on regular JavaScript objects and arrays.  Even if we sometimes use some helper functions from Lodash, we believe the code remains simple enough.

## Connecting components

The single store solves one of the big problems in designing an application with multiple components, how to communicate them.  For example, in our task editing example, the effect of clicking a button on the `Task` component affects the `TaskList` component because it is the `TaskList` that decides whether to show the `Task` or `EditTask` component:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/taskList.jsx#L7-L18)

If the list of tasks in a project (the `tids` array) is not empty, then it will show either the `Task` or the `EditTask` component depending on whether the `tid` of the task equals the value for `editTid` which, of course, is extracted from the store via `mapStateToProps`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/taskList.jsx#L26-L29)

Note also the use of the `key` pseudo-attribute when rendering the `Task` and `EditTask` components. This ensures that React easily identifies what element has changed and leaves the others alone.

## Other reducers

Reducers are not limited to responding to `action.type`.  In the async actions created via `asyncActionCreator` we are packing extra information in the `meta` object within the request.  The `request` reducer responds to that:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/requests/index.js#L12-L37)

For any action type beyond `CLEAR_HTTP_ERRORS`, which sets the `errors` array to an empty one, the reducer branches off based on `action.meta.asyncAction`.  For each `REQUEST_SENT` it increments the `pending` count by using the `$apply` command, which applies the given function to the current value.  For each `REPLY_RECEIVED` it decrements the `pending` count, ensuring it doesn't go below zero, just in case there was any mismatch.

For a `FAILURE_RECEIVED` it also decrements the `pending` count and it also pushes the error information into the `errors` array. As mentioned before, `update` can process two commands at once.

As usual, for any other action, it simply returns the state, unmodified.

More than one reducer can act upon the same action.  The `request` reducer responds to any action type with the correct `action.meta.asyncAction` information, regardless of what the main recipient of the action might do with it. Most of the time, the main reducer will only respond to the action with `action.meta.asyncAction` set to `REPLY_RECEIVED` because until the reply is successfully received, there is nothing to do.  For example the reducer for the `tasks` sub-store:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/tasks/reducer.js#L18-L21)

If a reply came with an error or is not of a `REPLY_RECEIVED` sub-type, it simply ignores it, returning the state, unmodified, not even bothering with what the `action.type` might have been.

Some failed actions might require a reducer to do something:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/projects/reducer.js#L24-L38)

If a client requests a non-existing project, the server would respond with a 404 error.  If we did nothing about it, the client might keep asking for that same project.  Thus, it might make sense to actually signal that error in the store so that the client does not keep asking for it, over and over again.  For other action types, we ignore the error since we don't need to change anything in the `projects` sub-store, the `request` sub-store is the one dealing with the error.

We also take care of avoiding unnecessary changes.  The actions `ALL_PROJECTS` and `PROJECT_BY_ID` might be dispatched almost at the same time if a client navigates directly to an URL such as `http://localhost/projects/25`, for example, by clicking on a link sent in an email by a colleague.  The `/projects` part would trigger the `ALL_PROJECTS` and the `/25` would trigger the `PROJECT_BY_ID` almost at once.  The replies,however, might arrive in any order. That is why we avoid overwriting information that might already be there due to an out-of-sequence reply:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/projects/reducer.js#L50-L58)

The list of projects, as it comes from the server, is an array stored in the `payload` of the action.  To improve access time, it is better to have it indexed.  Thus, we loop over the projects in `payload` using `reduce` to assemble the `NewProjects` object.  We extract the `pid` from each `project` in the array an use it as the key in `newProjects`.  However, if a given `pid` is already present in `state`, possibly because the reply to `PROJECT_BY_ID` arrived first, we don't add it to `newProjects`.  When we call `update`, we ask it to merge the assembled `newProjects` with the existing ones.  Since we skipped over the existing ones when assembling `newProjects`, `update` will make a shallow copy of those.   We go through a similar process in `tasksReducer` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/tasks/reducer.js#L22-L30)

The other way around is a little more complex because the reply to `PROJECT_BY_ID` contains more information than the very basic data that the `ALL_PROJECTS` listing receives.  Thus, if the basic project information exists, the extra information needs to be merged with the existing one.

## Store File Structure

The structure of the files for each of the sub-stores varies according to the complexity, though it follows a few simple principles presented in [Ducks](https://github.com/erikras/ducks-modular-redux#ducks-redux-reducer-bundles)

* One folder per sub-store
* The reducer for that sub-store must be the default export
* The action creators must be exported as named exports.
* The action types may be exported as named exports, though we prefer to change that *may* into a *must* because it helps with unti testing.
* The action types, being constants, follow the C convention for constants, all uppercase characters with underscores in between words.
* Action types are strings with several parts separated by slashes `/` with the first part being the name of the sub-store they are being declared in, usually  the folder name.
* Each folder must have an `index.js` file which contains all the above exports, either because
  * they are defined there, like in `misc` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/misc/index.js)
  * they are consolidated in it by re-exporting the exports of the files they are defined in, like in `projects`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/projects/index.js)

## Creating the store.

Now that we have all the reducers in place, we can create our store.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/createStore.js#L5-L16)

We import the default export from the default `index.js` file from each of the folders for the sub-stores and then we use Redux `combineReducers` to collect them all into a single reducer.  `combineReducers` takes an object literal with the name to be given to the sub-store as its property names and the reducers as the property values.  Since they usually match, we take advantage of ES6 [shorthand property names](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Property_definitions) feature, except for `routerReducer` whose sub-store we will call `routing`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/createStore.js#L18-L29)

Our default export in `createStore.js` will be our function to create the store instance, which calls Redux own `createStore` with the combined reducers, an `initialState` and the middleware to use.

Isomorphic applications running on the client side usually receive the `initialState` from the server, Redux doesn't really care where it comes from.  After loading the given `initialState` Redux will call each of its reducers with a fake action type.  When a reducer is called with an empty state, it should initialize it.  We've handled that via ES6 *default parameter value*:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/requests/index.js#L12)

In a regular application or on the server side of an isomorphic application, there is nowhere to get the `initialState` from so it is important to have those default initializers.

The third argument to Redux `createStore` is a function called an *enhancer*.  Redux provides one such enhancer, `applyMiddleware`, which takes a series of middlewares and enhances Redux with them.  We use `applyMiddleware` to load `redux-thunk`, which handles asynchronous actions, and the routing middleware, which is the one needing to access the `history` being used.

There are other types of *enhancers* such as the [Redux DevTools](https://github.com/gaearon/redux-devtools) which are also available as browser extensions for [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/remotedev/).  If any of them has been installed in the browser, they show up as a function in  `window.devToolsExtension`.  So, if we are not in *production* mode (which presumably means we are in *development* mode) and there is a global `window` variable and that `window` has a `devToolsExtension`, we `combine` the middlewares with the development tools, otherwise, we simply use the middlewares only.  `combine` simply calls each of the functions in sequence, which is all the *enhancers* need.

To make it easy to access the action creators, we can also collect them into one export:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/actions.js)

Thus, any component can simply import whatever action creators it needs from a single source. At least, that would be the theory, unfortunately, we don't really have an ES6 environment but we are transpiling ES6 into ES5 to emulate one and dynamic re-exporting doesn't fully work.  Ideally, we would just do:

```js
export * from './projects';
export * from './tasks'
export * from './requests';
export * from './misc';

export { push, replace, go, goBack, goForward } from 'react-router-redux';
```

Because each of the `index.js` files for each of the sub-stores would either expose the action creators or re-export them from wherever they are actually declared.  The transpiled code, however, doesn't cope with these two levels of re-exporting and it is better to import everything from the actual source.  By the way, re-exporting all by using the `*` does not include the default export so there will be no reducers in the combined `_store/actions` file so only the named exports will be there, the action types and action creators.
