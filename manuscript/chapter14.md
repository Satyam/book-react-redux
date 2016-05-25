# Actions, Stores, Flux and Redux

Allowing each React component to deal directly with its own data turns out to be impractical except in the simplest cases.  As we have seen in the previous chapter, when two different components show the same data, there is the problem of how they can notify each other of changes.  If the data resides in a remote server, as is often the case, sharing responsibility on those remote operations further complicates the matter.

A possible solution to these issues comes in the form of *actions*, *stores* and a consistent direction in the flow of information.  These ideas were presented by Facebook as the [Flux](https://facebook.github.io/flux/) architecture.

Basically, the idea is that all data should reside in a *store*. Components will always show information from this store. Any external event that might affect the data should trigger an *action*, a sort of custom event, which broadcasts the request for any change along with the new data and enough context information to figure out where that new data should go. Stores receive these actions and change the data accordingly and then notify the components that subscribed to these notifications.

Lets go back to our example of projects and tasks lists.  In the `Task` component, when we got a click on the list item we fired our own custom `onCompletedChange` event. The parent `TaskList` component subscribed to this custom event and when it received the event, it added its bit of information and fired `onTaskCompletedChange` which finally reached `Project` that changed the data. All this passing of information one way and events back up is long and tedious.  If `Project` had propagated it even further up to `ProjectList` and made it aware that the pending count had changed it might have updated itself.  However, this would have implied propagating the event through very many components, making them all too dependent on one another. There is not really a single good answer to that way of doing things.

In the Flux architecture, the mechanism is for `Task`, on receiving the `onClick` DOM event, to *dispath* an *action* indicating the `type` of action (usually a constant equated to a descriptive string) the `tid` and `pid` of the task affected and the new value for `completed`.

All actions are received and acted upon by the store or stores which hold the data.  Components will subscribe to receive notification of changes in the data they are interested in.  When they get such notification, they refresh themselves reading the newly updated information from the store.

The DOM might not be the only source of *actions*. Receiving new data from the server is also a valid source of actions, be it in response to an earlier HTTP request or through a [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) `message` event.

Whichever way it might be triggered, the mechanism is simple and predictable, any sort of external event dispatches an action that goes to the store which then updates the data and notifies the interested components that there have been changes so they can refresh themselves.

All this also makes it easier to test since a test suite is as good a source of actions as any other.

Though Facebook has implemented a [Flux library](https://www.npmjs.com/package/flux), Flux is basically a concept, an architecture, and as such, there are many implementations.  Probably the most popular of them is [Redux](http://redux.js.org/) which is what we will use.

## Redux

To use it we first have to load it:

```
npm i --save redux
```

We need to define the constants that represent the action types.  We add an `actions.js` file which will just contain action constants which should be unique. We might use the new ES6  [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) object which will always produce unique symbols, but the problem with those is that they are completely local to each client. If we ever plan to send actions from remote sources via WebSockets or any other mechanism, Symbols cannot be serialized into a message.

We only have one action to deal with, toggling the completion state of a task.  We define a constant to represent that action type, which we export.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-01/client/actions.js)

Next we create our store.  We will do it from the `data.js` using Redux's [`createStore`](http://redux.js.org/docs/api/createStore.html) method.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-01/client/store.js#L30-L39)

We immediately export the store that `createStore` returns.  That will be our single store for all the application.  We initialize the store with `data` which we read from `data.js`. Our store will have a computed `pending` property which is not present in the raw data so we have to initialize that computed property from the data before creating the store.

The first argument to `createStore` is a *reducer*.  In Redux parlance, a *reducer* is a function that receives the current state of the store and an action and returns the new state of the store.

Our store handles just two cases, one is the `TASK_COMPLETED_CHANGE` action, the other is *anything else*.  Redux requires that when a reducer does not recognize an action, it should return the state unmodified.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-01/client/store.js#L6-L28)

Our simple reducer switches on `action.type`.  As mentioned, on the `default`, we simply return the state, unmodified.  That is the boilerplate code for any reducer, a `switch` statement branching off based on `action.type` with the default returning the state as received.

An important design consideration in Redux is that the state object should never be modified, the reducer should always return a new state object, based on a clone of the original one suitably modified. It might seem that all this cloning of potentially large stores might slow things down but, as it turns out, it allows for some optimizations elsewhere that somehow compensate for this. To start with, we read from the store far often than we change it thus a single expensive update pays off if it simplifies very many reads.  It also allows for certain features either impossible or hard to manage in other ways such as [infinite undo/redo](http://redux.js.org/docs/recipes/ImplementingUndoHistory.html) since, after all, it is just a matter of keeping track of all those immutable states.

One way to do that would be to do a deep clone of the whole store and then apply the changes. This is terribly expensive so we won't event see how to do it because it is completely out of the question.  Instead we will use the [`update`](https://facebook.github.io/react/docs/update.html) add-on by the React team.  There are several other alternatives to this add-on such as  [Immutable.Js](https://facebook.github.io/immutable-js/).

We install the add-on as any other package:

```bash
npm i --save react-addons-update
```

And `require` it just as another module, dropping the`react-update-` prefix and calling it simply `update`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-01/client/store.js#L2)

Update takes an object and returns a new object made out of parts of the original and parts changed.  Imagine we are changing the completion status of a task in the branch with `pid: 34`.  Nothing changes in the branch for `pid: 25` so, what `update` does is to copy the reference to the whole of the branch for `pid: 25` without traversing it at all. It will make a clone of the branch for `pid: 34` but only partially. When it gets to the `tasks` collection, it will copy over the references to those tasks that are not affected and only clone the one we mean to change.  Finally, it performs the changes.

For `TASK_COMPLETED_CHANGE`, we do something apparently quite complex:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-01/client/store.js#L9-L23)

The second argument to `update` is an object which describes where the changes should go.  The object is not very different from what `Object.assign` would take as a second argument when doing a merge.  Notice that when we write `[action.pid]:`, we are using a new ES6 feature called [computed property name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Computed_property_names), it is not specific to `update`.

What is specific to `update` are the property names starting with `$`.  They are [commands](https://facebook.github.io/react/docs/update.html#available-commands) telling `update` what to do.  For `pending` we are using a function to return the new value based on the previous value, which `$apply` provides as an argument.  For `completed` we are simply setting its new value with `$set`. The way we updated `pending` is not foolproof and is not mean to go into production, it was just a means to show how to use `$apply`.

## Dispatching an action.

To get everything started, the component needs to dispatch the action:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-01/client/task.js#L20-L25)

The new `handler` no longer changes the data directly, nor it fires an event for the benefit of the parent component, it simply dispatches the action to the store with all the necessary information.

Any component that needs to be aware of changes in the store needs to subscribe to it.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-01/client/task.js#L10-L15)

The `componentDidMount` and `componentWillUnmount` methods of `React.Component` are a good place to subscribe/unsusbscribe since they are complementary to one another. The first happens when the component initializes, the second before it is destroyed. These methods, amongst others, are called [lifecycle methods](https://facebook.github.io/react/docs/component-specs.html#lifecycle-methods).

The `store.subscribe` method returns a function that, when called, unsubscribes the listener so we save it into a property for later use.  The callback simply calls `forceUpdate` to get the component re-rendered. This is a bad strategy, as we will see in a moment and should never be done in a real application but, for the time being, it shows how Redux works.

Finally, while initially the component got the list of tasks to enumerate from `this.props.tasks` now it takes them straight from the store via `getState`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-01/client/task.js#L27-L29)

We also have to change `ProjectItem` so it can subscribe to the changes in the count of pending tasks.  Our original `ProjectItem` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-06/client/projectList.js#L7-L15) was a stateless component declared in `projectList.js` so we first have to change it to a stateful component so it gets all the extra methods inherited from `React.Component` such as `forceUpdate`, `componentDidMount` and `componentWillUnmount` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-01/client/projectItem.js#L5-L25) and put it in its own file.

Subscribing and unsubscribing is just the same as in `Task` and now instead of reading the data from `data.js` it reads it from the store via `store.getState()`. [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-01/client/projectItem.js#L12-L14)

## Using `shouldComponentUpdate`

As it is, this example is extremely inefficient.  Redux notifies all its subscribers of any change anywhere in the store.  Components cannot tell the store which changes they are interested in.  Forcing an update on any change as we have done so far [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-01/client/task.js#L11) is basically the same as re-rendering the whole application on every single change.

We will use another of React's component lifecycle methods called [`shouldComponentUpdate`](https://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate) that should return a Boolean signaling whether the component should be refreshed or left alone.  The default version always returns true.  We have to override it:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-02/client/task.js#L14-L17)

The method is called just before any changes to either the received properties or the internal state are actually saved. It receives the future, presumably changed, values as arguments and can access the existing ones as `this.props` and `this.state`.  We compare the new and existing values of `descr` and `completed` and if they have changed, we return true, allowing the refresh to go on.

To have something to compare with, we first store the initial values into `this.state` in the constructor:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-02/client/task.js#L6-L9)

We obtain the values of the task from `getTask`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-02/client/task.js#L31-L33)

And, when there is a change in the store, we update them:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-02/client/task.js#L11-L13)

This is one of the reasons why we should never set the `state` directly, except in the constructor.  The `setState` method does a number of things before actually changing `this.state`, one of them being to call `shouldComponentUpdate` and, if it returns true, it queues the refresh. That is also why we should never access `this.state` right after calling `this.setState`.  All changes are asynchronous as they are batched to be done all at once which is more efficient than applying one little change after another.

We apply the same strategy to `ProjectItem` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-02/client/projectItem.js).

## Redux principles

This example has been mainly focused on the basics of Redux, however, it is rarely used like this. Instead of providing all the functionality that every developer might need, Redux has concentrated in doing extremely well a minimal set of core functionality, delegating all bells and whistles to the very many extras available from NPM.

Redux is based on a few very basic principles.

#### Single source of truth

All data and state information is stored in just one place, the *store*.  No more wondering where should this or that be stored, who is responsible for changing it or how to notify the interested parties.  All data goes into the store and the reducers change it as requested via actions.

Our store only contains information about projects.  Should we need to store other information, we simply nest the project information under some property within the single store.  For example, instead of creating our store via

```js
const store = createStore(reducer, data);
```

We might do:

```js
const store = createStore(reducer, { projects: data, otherInfo: otherData });
```

#### Components don't modify the store

As far as components are concerned, the store is read-only.  Components don't write into the store, they just read from it via `getState`.  Whenever a change is needed, they `dispatch` an action with all the required information.

#### All actions are handled by *reducers*

Reducers are functions that receive the current state and an action and return the new state. Though we have just one reducer in our example which receives the whole of the store as its state, in practice, we will write reducers to handle each a little part of the store, and then combine them via the aptly named `combineReducers` method.  Each set of reducers would receive only the part of the store it is prepared to handle.  For example, if we nested the store as shown earlier, we might have:

```js
const reducer = combineReducers({
  projects: projectReducers,
  otherInfo: otherInfoReducers,
});
```

Redux will use the property names to extract that part of the hierarchy of data within the store and call the corresponding reducer with only that part.

#### Reducers return a new state object

Reducers should never modify the state received.  They should always return a new state object with the relevant information changed. (Copying references to unmodified branches is Ok)

#### Reducers must return the unmodified state on unknown actions.

All reducers receive all the actions whether they matter to them or not.  Thus, if a reducer doesn't know about a certain action type, it should return the same state it has received instead of `null` or `undefined` because some other reducer might deal with that action.

#### Reducers must return the default initial state if state is undefined.

This is usually handled via the new ES6 default argument value feature.

```js
const reducer = function(state = someInitialState, action) {/*...*/};
```

#### All reducers are pure functions

Reducers should only depend on the arguments it receives, the `state` and the `action`.  They should never rely on other possible sources of state information.  These are called *pure* functions.  They are extremely easy to test since they don't have any memory of previous states which can affect their outcome.
