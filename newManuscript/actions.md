# Actions

In Redux parlance, *actions* are signals sent to the store to let it know that something has happened so the store can have its state adjusted.

It might be a good time for some basic definitions.

* *Store* is where all the data handled by Redux is kept and by extension everything related to its operation.
* *State* is a snapshot of the data in the store.
* *Action* is an object that contains enough information for the store to act on it and possibly change its state
* *Action Type* is the value of the `type` property of the *action* which serves to identify each kind of action.
* *Action Creator* is a helper function that assembles an action.
* *Dispatch* is when an action gets queued with the store so it gets processed.
* *Reducer* is a function that actually changes the state of the store based on the information received in the action.

Except for the *reducer* we have already mentioned the others.  We will see reducers in the next chapter.

The only action creator we have seen so far has been `clearHttpErrors`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/requests/actions.js#L8-L10)

Since it has no arguments, it always returns the very same object, which is the actual *action* that would eventually be dispatched.  An *action* is  an object with, at the very least, a `type` property, which is usually a descriptive string:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/requests/actions.js#L8-L10)

To ensure the uniqueness of the strings, we make them out of several parts separated by slashes, the first part being the part of the store they deal with which, in this case, is reflected in the folder containing its source code.

Though the new `Symbol` object could be used to create unique action types, it is not a good idea because they are hard to visualize in the debugger, after all, the only thing the developer could visualize in the debugger is the description. Thus, though two symbols would always be different, their descriptions might not and that would confuse anyone tracing a bug. For example:

```js
Symbol('hello world') === Symbol('hello world')
// returns false
Symbol('hello world').toString() === Symbol('hello world').toString()
// returns true.
```

The `toString()` value is what the debugger would show thus, we would still need to create unique descriptions. Symbols don't actually require descriptions, but that would still be worse because then they would all be anonymous.

Most importantly though is that Symbols cannot be serialized.  JSON will ignore them just as it does with functions.  In any application connecting several clients, such as games or chat, actions must be transmitted to remote systems and Symbols simply don't get through.

```js
JSON.stringify({type: Symbol('hello world')})
// returns {}
```

## Asynchronous actions

Regular actions are good for situations when you have all the information already available.  In the action we create via our `clearHttpErrors` action creator, there is no extra information just the action type. Sometimes, to fulfill an action, we might need more information, for example, a response from a data server.  This is complicated to handle via plain, basic Redux but we may add some middleware to help us.

[Redux-Thunk](https://www.npmjs.com/package/redux-thunk) can be added to a Redux store so it processes the actions before they get acted upon.  When Redux-Thunk receives an action, if it is a function, it will call it, otherwise it lets it pass through. Redux-Thunk provides two arguments, the `dispatch` and `getState` methods of the store.  Usually, only `dispatch` is used as any other information required can be provided by the code calling the action creator.

The lifecyle of a typical async action creator has a few basic stages:

1. dispatch a plain action to signal that the action has been initiated
2. start the async requests
3. on a successful reply, dispatch a plain action with the information just received
4. if the request fails, dispatch a plain action with the error information

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/utils/asyncActionCreator.js#L7-L14)

We have created a utility function `asyncActionCreator` that helps us with this.  It receives an action type, the actual async request, which can be anything that returns a Promise and a `payload` which is an object containing the information related to the request.

`asyncActionCreator` returns a function, which allows Redux-Thunk to identify it as an asynchronous action.  It then calls it passing a reference to `dispatch` as an argument.  `asyncActionCreator` first calls `dispatch` to indicate that the async action has been initiated.  For all its actions, it uses the Flux Standard Action ([FSA](https://github.com/acdlite/flux-standard-action)) format, which provides a predictable and flexible format to pass information. Redux itself does not require any particular format, it only cares about the `type` property, but anything that makes matters more predictable is good.  

FSA expects an action to have only four properties with `type` being the only mandatory:

* `type`: mandatory, as per Redux rules.
* `payload`: an object with all the information related to the action.
* `error`: a Boolean, usually only present if it is true, it indicates a failed request.  If so, `payload` should contain an error object.
* `meta`: A place for whatever extra information might be required.

In our initial action, we are using the `type` and `payload` received as arguments and we are adding in the `meta` an object with the `asyncAction` property set to `REQUEST_SENT`, a sort of sub-action type that signals that this is the initiation of the action signaled by the actual `type`.  Thus, for an action `type` of `ADD_PROJECT` we will have an `ADD_PROJECT`/`REQUEST_SENT` and then an `ADD_PROJECT`/`REPLY_RECEIVED` or, if anything fails an `ADD_PROJECT`/`FAILURE_RECEIVED`.

Since the `asyncRequest` argument is a Promise, we attach to the `then` part and return that, which is still a Promise.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/utils/asyncActionCreator.js#L15-L19)

For the *resolve* part of the `then` we respond by dispatching an action with the same action type but with a `REPLY_RECEIVED` sub-action type.  For the payload, we merge the data received in the response with whatever came in the `payload` argument.  Even if the reply is an array, as it frequently is, `Object.assign` will work and return an Array with the extra properties from `payload` added.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/utils/asyncActionCreator.js#L20-L35)

For the `reject` part of the `then` we assemble an `err` object which is a plain object literal, not an instance of the Error class.  This is because it is not a good idea to store class instances in the store.  The reason is similar to why we prefer not to use `Symbol`s for action types, neither is serializable.  In isomorphic applications, it is not enough to send the rendered HTML from the server to the client, it is also important to send the data that produced it and to do that, we have to serialize the store.  Dates already pose a problem on serialization, we can do without further class instances.

As per [FSA](https://github.com/acdlite/flux-standard-action), we set the `error` property and send the error object as the payload. We include both the `actionType` and the `originalPayload` as part of the error object, just in case any component might need it.  

We have opted to use the same action type for all three possible messages for each action. We then discriminate amongst them via the `asyncAction` property in `meta`.  This is just a matter of choice and neither Redux nor FSA forces us one way or another.

The use of a consistent sub-action for async actions allows us to easily count outstanding async requests and thus show the `Loading` component.  On each `REQUEST_SENT` sub-action the `pending` count goes up, regardless of the action type. On each `REPLY_RECEIVED` or `FAILURE_RECEIVED`, the `pending` count goes down.  Additionally, on each `FAILURE_RECEIVED`, the `payload`, which contains the error object, is saved for later use.  We will see how this is done in a later chapter.

## Using asyncActionCreator

As with all actions, we first define the action types:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/projects/actions.js#L4-L10)

To perform HTTP REST requests, we use the new [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch) global method.  Since not all browsers or NodeJS versions support it, we use suitable polyfills, which we will look at later on. For the time being, we may assume `window.fetch` or `global.fetch` are present, somehow. We use a small utility to provide us with pre-configured instances:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/utils/restAPI.js#L35-L63)

As the last few lines show, this utility returns an object with the basic four CRUD methods, created from `restClient`.  Each of those methods will take a URL and optionally a body and it will return a `Promise` which, on success (the `.then` part) will return the data requested or on failure (the `.catch` part) an error object which might be an actual instance of `Error` or just an object literal with error information.  Since our errors go into the Redux Store and it is not recommended to store non-serializable objects such as an `Error` instance, for our own custom errors, we don't bother creating ephemeral `Error` subclasses which we would then have to convert back to plain objects to have them stored.

`restClient` calls `fetch` with a full URL made up from our predefined `HOST`, `PORT` and `REST_API_PATH` constants, then the `base` entry point for this family of APIs, such as `projects` and then the relative `path` for this request.  In the configuration we set the `method` from the argument, set the headers to tell we are going to use JSON in both directions, set the `credentials` so that cookies can be sent and, if there is a `body` we encode it with JSON.  Then, if the `response` is `ok`, that is, in the 2xx series, we return the same `response` to allow the processing to keep going, otherwise, we use `Promise.reject` to force an failed response.

The same source file contains a part that is meant for use with Electron.  We will look at it later.

We use the `client` object to cache the pre-configured client connection to each of the `base` entry points.

We also create some handy aliases for the regular HTTP verbs.  It is easy to confuse `PUT` and `POST` so we create aliases for the 4 CRUD operations.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/projects/actions.js#L12)

With this utility it is easy to create an instance by just providing the specific entry point for this set of operations.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/projects/actions.js#L14-L19)

The `getAllProjects` action creator needs no extra arguments.  It calls `asyncActionCreator` with the `ALL_PROJECTS` action type and the result of doing a `read` (or `get`) operation on the pre-configured connection.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/projects/actions.js#L37-L43)

Other action creators are a little bit more complex because they need to provide more information in the URL, in this case the `pid` and `tid` and also extra information that goes in the body of the HTTP request, `name` and `descr`. We use `descr` instead of the customary `desc` for *description* because `DESC` is a reserved word in SQL and many other query languages so using `desc` as a column name causes lots of trouble.  While for the REST API we need to discriminate in between *id* values that go in the URL and plain data that goes in the body, for the `payload` argument, we simply pass on all the received arguments in an object. When assembling the payload, we are using the [*shorthand property names*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Property_definitions) feature of ES6.

Note that in all cases we return the Promise returned by `asyncActionCreator` which is none other than that the one created initially by the `api.read` or `api.update` or whatever `asyncAction` we initially passed to `asyncActionCreator`.  The `dispatch` method of Redux always returns the action it receives and if we have React-Thunk to process asynchronous actions, it will return whatever Promise it returns.  This allows further chaining, for example:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/project.jsx#L60-L65)

The `onDeleteClick` property that `mapDispatchToProps` provides to the `ProjectComponent` first dispatches the request to delete the project by `pid`, `then`, it dispatches an action to the router `push('/projects')` to navigate away from the page showing that project, since it has already been deleted. The `push` action creator comes from React-Router and it is named so because the browser history is handled like a stack so new locations are pushed into it so that they can be popped when going back.
