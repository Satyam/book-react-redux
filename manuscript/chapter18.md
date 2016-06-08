# Asynchronous operations

Though we started this book developing the server-side part of the application and even as recently as in the last chapter we reviewed the REST API, since we started with React, we reverted to our `data.js` file loaded in memory on the client side for all our operations.  This was done to decouple the issues of handling the UI from handling the communication with the server, but it is high time we connected both sides.

While we were dealing with data loaded on the client-side, all our operations have been synchronous, whenever we did something, it happened everywhere all at once, *everywhere* here meaning all within the client.  This is hardly the case in real life.  The client will deal with information that is stored in a remote server and reaching it will always require asynchronous operations.

Currently, our client-side application loads the two collections within `data.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-03/client/store/projects/data.js) as the default state in our two reducers, `projectsReducer` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-03/client/store/projects/projectsReducer.js#L15) and `tasksReducer` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-03/client/store/projects/tasksReducer.js#L6). From then on, all the information is permanently available in the client.

We need to move away from this mechanism and make the client request the data from the server via the REST API on demand instead. Our first step will be to remove `data.js` and drop the references to it from both reducers [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-01/client/store/projects/projectsReducer.js#L4) and [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-01/client/store/projects/tasksReducer.js#L4).  A reducer should never return `undefined` so, if the state is `undefined` they should return an empty object instead:

```js
export default (state = {}, action) => {
```

If we run the application in this state, it will show no project listing nor will it show a specific project if its URL, such as `http://localhost:8080/projects/25`, is given.  It will show no application errors, since the lack of projects is a real possibility and the application handles it nicely.

## Phases of a remote request

Remote requests have two phases, the request itself and the response which might be successful or not.  These events must be reflected in our application, for example, by showing a spinner while the data is being fetched, an error message if it failed or, hopefully, the requested data when it succeeds. For the components to show any of that, those events must change the store somehow and the only way to modify the store is via actions.

That is why for every remote operation we will define three actions with three different suffixes, `_REQUEST`, `_SUCCESS` and `_FAILURE`.  Thus, to produce our projects list, we will have `PROJECT_LIST_REQUEST` which will initiate the request for data, and `PROJECT_LIST_SUCCESS` when the reply arrives.  Occasionally we might receive a `PROJECT_LIST_FAILURE` so we must plan for it as well.

It is easy to envision where to dispatch the request action, the data container component could do that as with any other action.  However, where can we dispatch the rest of the actions?  Most HTTP request packages will either expect a callback to be called when the reply arrives, or will return a Promise to be resolved with the reply.  The problem is, how can we provide these callbacks with a reference to the store and its `dispatch` function?

It would be great to have some means to tell Redux when an action will be resolved in the future and tell it what to do at that point.  Redux on its own has no ability to do this, whenever it receives an action, it acts upon it straight away.  But we can expand Redux's abilities via middleware.

## Redux Middleware

We have already used middleware in the server-side code.  Generically, middleware is a piece of code that stands in the middle. In Express, the middleware is able to intercept requests, possibly do something about them, and then let them pass on to its final destination or not.  We even wrote some middleware ourselves [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-03/server/projects/validators.js#L12-L69) to validate the request parameters before they get into the function that actually processes the request.

In Redux, middleware stands in between the actions dispatched and the reducers that process them.  Just as Express middleware receives the HTTP request, Redux middleware receives the dispatched action and can do something with it before it gets processed by the reducers.

We have already used a bit of middleware in the client, the `routerMiddleware` from `react-router-redux` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-03/client/store/createStore.js#L13) as part of the recipe to store location information in the store.   

In this case, we need middleware that is able to process asynchronous actions, that is, actions that will have effects in the future.

There is a package [redux-thunk](https://www.npmjs.com/package/redux-thunk) by the same author of Redux that helps us deal with this.  We install it just like a regular dependency:

```
npm i --save redux-thunk
```

As with all middleware, we somehow need to register the middleware.  In Express, we used `app.use`, like with `bodyParser`, `express.static` and some others.  With Redux we use `applyMiddleware`

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/store/createStore.js#L13-L20)

The `createStore` method requires the combined `reducers` as its first argument, then an optional initial state for the store, usually an object and then an *enhancer*, a function that adds capabilities.  If the second argument is not an object but a function, `createStore` assumes it to be the *enhancer*.  We were already using one such enhancer, the Redux developer tools [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-01/client/store/createStore.js#L11-L13) and later we added `routerMiddleware` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/createStore.js#L12) via another enhancer, `applyMiddleware` that is part of Redux.  The `compose` function, also part of Redux is simply a generic utility function that when called, calls each of the functions passed as its arguments in sequence.  Since we have a single slot for enhancers and we have two of them we need to call both of them in sequence, that is all `compose` does.  We simply add `redux-thunk` to the list of middleware to apply [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/store/createStore.js#L14).

A normal action is a simple object with at least a `type` property [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/projects/actions.js#L3-L8).  To tell Redux that an action will have secondary effects in the future, instead of a simple object we dispatch a function. Just as any other middleware, `redux-thunk` gets all the actions and, if it is an object, it lets it through to be handled in the normal way.  However, if any of them is a function, it will call it with a reference to the `dispatch` function  bound to the store.

So, from the developer point of view, it is quite simple.

* If we dispatch an object, it is a regular synchronous action that will be taken care of immediately.
* If we dispatch a function, it is an asynchronous action, `redux-thunk` will intercept it and call it with a reference to the `dispatch` method.  The function is then responsible to dispatch further actions at its convenience.   

To dispatch actions, we usually use *action creators*. For example, we have a simple synchronous action creator to set the task completion status:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-16-03/client/store/projects/actions.js)

An asynchronous action creator looks like this

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/store/projects/actions.js#L26-L40) :

We already have defined our three action type constants following our convention of a common base name plus the suffixes `_REQUEST`, `_SUCCESS` and `_FAILURE`.

The `getAllProjects` action creator returns a function, a *fat arrow* function, that expects `dispatch` as its argument. This is the key for `redux-thunk` to know this is an asynchronous action. The first thing it does is call `dispatch` to dispatch the REQUEST action to notify all interested parties that a request is going out.  Then it sends the actual HTTP request using Axios as we already did in our server tests [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/test/server.js#L105-L129)

Axios returns a Promise so, when it is resolved, we dispatch either a SUCCESS action or a FAILURE action, each with its associated data.  These two actions will happen some time after the original request is sent.  All actions dispatched from the asynchronous action are synchronous themselves, they are all plain objects but they might have been further asynchronous actions, Redux doesn't mind at all.

For the FAILURE action, we use the `fail` function defined at the top:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/store/projects/actions.js#L14-L21)

The function is actually a function returning a function, that is a *curried function*.  When called with the reference to the `dispatch` method and the action type, it returns a function that might eventually be called when a failure occurs.  At that point it will receive the failed response.   Though each successful response will require processing it in different ways, all failures are processed just the same because all contain the same information.

We are using a pre-configured instance of Axios.  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/store/projects/actions.js#L10-L12)

Since we might use Axios elsewhere, we created a utility function `restAPI` that returns the pre-configured instance based on the base address for all the requests, in this case `'data/v2/projects'`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/utils/restAPI.js)

The instance is set to handle data in JSON format and as a convenience, we have added aliases to the normal REST operations so that `read` becomes an alias for `get` but, most important, `create` is an alias for `post` and `update` for `put`.  After all, since we are doing CRUD operations on the database, it makes sense that we use those operations in the API as well, besides, `post` and `put` are often confused with one another.

Since we expect to have several utility functions, we have added an alias to our `webpack.config.js` file to make it easy to import them [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/webpack.config.js#L24).

In the `getAllProjects` action creator we return the Promise that Axios returns [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/store/projects/actions.js#L31).  This is not mandatory, `redux-thunk` doesn't care about the return value, it will simply pass it on as the return of the action creator function, just in case it cares about it.  In our case, we don't, but it is good to know it is available to us.  We will use it in the future.

Now we need the reducers to process these actions.  Originally, we simply had our store initialized from `data.js` and we handled a single action, `TASK_COMPLETED_CHANGE` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-17-03/client/store/projects/tasksReducer.js#L8-L17).

Now we have to handle one more action type, a successful response for our request:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/store/projects/projectsReducer.js#L22-L29)


Upon receiving the `ALL_PROJECTS_SUCCESS` action, since the data in the response is an array, we use Array `reduce` method to return the new state using the current state as the initial state for `reduce`.  For each item, we use `update` to merge the new values into the original state, or keep the ones if we already have them. The resulting state will not have all the project information because we explicitly asked for just a few fields, `pid`,  `name` and `pending`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/store/projects/actions.js#L31)

Since we don't have access to all the data on the client-side, we can no longer calculate the `pending` count for all projects by looping through the tasks, as we did before. We do not have and do not want to have all the tasks loaded because, in a real application, they might be too many.  Thus, we have moved the calculation of the `pending` count to the server side by using a nested SQL query to produce it on the database side:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/server/projects/transactions.js#L5)

The `getAllProjects` action creator provides information for the `ProjectList` component.   When we go into the detail of any of those projects, we need to request some extra information from the server via `getProjectById`.  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/store/projects/actions.js#L42-L61)

The action creator follows a similar pattern of initially dispatching the REQUEST action and then using Axios to send the request to the server.  Upon return, it either dispatches the SUCCESS of FAILURE action, the later through the `fail` curried function.

The `projectsReducer` handles this action, to fill the information it had not initially requested:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/store/projects/projectsReducer.js#L30-L54)

The operation looks somewhat long but it is actually composed of two separate operations.  In the first half is the case where the basic data for the project  is there thanks to `getAllProjects` and only some extra information needs to be added in. It adds the `descr` field and collects into `tids` the `tid`s of the individual tasks. The second is when no prior information exists and it all has to be merged in. Though the order of the requests might be predicted, the order of the replies can never be so both alternatives need to be handled.

It is up to `tasksReducer` to load the tasks information into the store:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/store/projects/tasksReducer.js#L19-L27)

The reason to use the Array `reduce` method instead of simply merging the received data is that our sub-stores are indexed by `pid` and `tid` respectively.  Thus, we need to go through each row and pick the `pid` or `tid` to use as index in the hash.

The `projectsReducer` and `tasksReducer` reducers do not care about the REQUEST or FAILURE actions, only the SUCCESS one.  Actions, like DOM events, are notifications of things happening, whether any part of the application is interested in doing something about them or not is another matter.

It might seem that after all this amount of code, something should happen if we ran the application, but it doesn't yet.

## Dispatching initial loading actions

We have seen how to create asynchronous actions and how to handle them, but we have not dispatched any yet.  Where should we do that?

Stateful React components have [several methods](https://facebook.github.io/react/docs/component-specs.html#lifecycle-methods) that we can declare and are called during the lifecycle of a component.  Two of them are of particular interest to us.  

The [`componentDidMount`](https://facebook.github.io/react/docs/component-specs.html#mounting-componentdidmount) method is called when the component is loaded for the first time. As the React documentation says, this is a perfect place to send AJAX requests. In our case, using Redux, it is the place to dispatch an action to initiate such a request.

The [`componentWillReceiveProps`](https://facebook.github.io/react/docs/component-specs.html#updating-componentwillreceiveprops) will be called on any further updates of the component presumably because the properties might have changed. The properties might not have actually changed. Doing a thorough check on all the values, specially on deeply nested objects, is too expensive so React calls this method more often than what is actually required and lets us decide, possibly using the [`shouldComponentUpdate`](https://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate) method. This later method is not written until after we do some performance analysis and detect too much [time wasted](https://facebook.github.io/react/docs/perf.html#perf.printwastedmeasurements) in some specific components.

We could rewrite some of our components and turn them from stateless to stateful to make use of these lifecycle methods, but that would be a pity. Stateless components are smaller, thus cheaper and, since they have less functionality, are faster to process. The are a new addition to React but are expected to benefit from huge performance improvements in the future since they are so lightweight.  It would be a bad idea to weight them down with extra code.

However, each of the stateless components that needs data from the store are wrapped via `connect` with a stateful component which is the one that actually deals with the store through the `mapStateToProps` and `mapDispatchToProps` methods.  Wouldn't it make sense to have the data containers be the ones responsible to dispatch the data loading actions?

The [`connect`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) method of `react-redux` actually returns a stateful component.  Though we often call it a *wrapper* it is, indeed, a fully featured React component, a HoC or High-order Component. Since React components are still regular JavaScript classes, we can extend them and have their methods redefined.  That is what we've done in `utils/initialDispatcher.js`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/utils/initialDispatcher.js)

The single function we export from `initialDispatcher.js` returns a curried function.  It is written in the same style as `connect` so that, whenever ES7 decorators become standard, it can be used as a decorator.  It is curried with an `initialDispatch` function and returns a function that can be applied to the component wrapped with `connect`.

It returns a new class which `extend`s the class `Connect` which it receives as an argument and redefines its `componentDidMount` and `componentWillReceiveProps` methods.  In each of them, it first calls the original `super` version (if there is any) and then calls the `initialDispatch` method which it also has received as an argument.  

It provides that function with a reference to the `dispatch` method (the same that `mapDispatchToProps` usually receives), the future properties, the current properties (none on componentDidMount since it is the first time and there are no current values yet) and the state of the store. It is used thus:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/components/projects/projectList.js#L25-L33)

In this case, taken from the `ProjectList`, if `state.projects` is empty `initialDispatch` dispatches the action created by `getAllProjects`.  

To apply `initialDispatch` to our data container we simply call it using the `initialDispatcher` function and the data container that wraps `ProjectList`.  We can export the returned class immediately as it is still a valid data container.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/components/projects/projectList.js#L40-L42)

So far we have modified `ProjectList` and the related actions and reducer.  We must do the same with the `Project` component:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/components/projects/project.js#L35-L48)

In this case, we check whether there is a project entry for the given `pid` and if it has any `tids` listed.  It there is a project but with no task references, it means the basic information was loaded by `ProjectList` dispatching `getAllProjects` but no detail yet.  A project with no tasks would have an empty array as `tids`, which evaluates as true, against `undefined` when none were loaded yet.

It is also important to provide the render methods in our components with an alternative when the data is not there yet. Originally, all our data was there from the very start, we were safe to assume that to be so.  With remote data, that is no longer true.  For example, the `TaskList` component must now check whether `tids` is not undefined before attempting to render it  [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-02/client/components/projects/taskList.js#L6-L14).

## Writing our own middleware

All the asynchronous transactions with the server take some time and all may fail. In between the REQUEST action and either of the SUCCESS or FAILURE actions, we might want to show a loading spinner and, if the outcome is a FAILURE, we would want to show the error message.  As with any status that might affect our application, both the loading status and the error messages will go into our store.

We will add another sub-store to our Redux store by adding a new reducer which will handle these two pieces of information:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/store/requests/index.js)

The sub-store will have a `pending` property which counts the number of pending HTTP operations and an `errors` array listing the errors reported by the failed operations.  Both are initialized by using the default parameter value for the `state` argument.

For every `REQUEST_SENT` the `pending` count is incremented and for any reply, successful or not, it is decremented.  On a `FAILURE_RECEIVED` a formatted error message is also stored in the `errors` array. Formatting the error information here is not a good idea, it would be better left to the UI designer later on, but for the purpose of this book it will do. The `CLEAR_HTTP_ERRORS` action clears the `errors` array.

The action-type constants and the action creators themselves are defined in `actions.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/store/requests/actions.js).

To dispatch all those actions, we would need to either add the three of them to each and every action creator that does an HTTP request or we might do something smarter, add a piece of middleware of our own creation.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/store/requests/middleware.js)  

The declaration of Redux middleware seems a little complex, it is a series of functions that return functions that return functions. All are *curried*, receiving each of the arguments as the chain of function calls progresses.  It first receives a reference to the store object, not the data in it but the store itself. We might read the state of the store by using the `getState` method but we only pick the `dispatch` method from it.  It then receives whatever `next` piece of middleware is there in the chain and finally the `action` object.   

At the bottom, we are calling `next(action)` to allow processing to continue.  We are not modifying the `action` object in this case, we are just letting it pass through, but other middleware might modify it or it might take care of the action itself and don't even call `next` at all.

Our middleware will pick one of three patterns at the end of the action type string.  It will look for strings ending in `/REQUEST`, `/SUCCESS` or `/FAILURE` and it will dispatch the corresponding action for each of them. Since all the failure actions contain the same information [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/store/projects/actions.js#L14-L21), we send the action object when dispatching `failureReceived` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/store/requests/middleware.js#L19).

This means that we only need to add one of these suffixes to our existing action types to make it work:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/store/projects/actions.js#L22-L24)

We have to add the reducer for the new sub-store in the main store:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/store/createStore.js#L5-L13)

And we must add the imported `remoteRequests` middleware to our list of middleware as well:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/store/createStore.js#L15-L19)

Of all the action types and action creators we defined [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/store/requests/actions.js), we are only re-exporting `CLEAR_HTTP_ERRORS`, `clearHttpErrors` because all the rest are dealt with in between the reducer and the middleware no other element outside of this folder cares about them.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/store/requests/index.js#L10)


Finally, since our store now has a count of pending HTTP requests and communication errors, if any, we should show them. We can do that in the `App` component:

[(:memo:html)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/components/app.js#L6-L7)

So far, `App` had no data to read from the store.  Now, it uses `pending` and `errors` from the `requests` sub-store so we must now wrap it with Redux `connect` HoC:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-18-03/client/components/app.js#L26-L36)

## Summary

We have learned how to handle asynchronous operations from the client by requesting data from the server via the REST API we had designed earlier.

We have used the `redux-thunk` middleware to handle those asynchronous actions.

We have also written a simple Redux middleware.
