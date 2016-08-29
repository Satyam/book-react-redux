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

Most importantly though is that Symbols cannot be serialized.  JSON will ignore them just as it does with functions.  In any application connecting several clients, such as games or chat, actions must be transmitted and Symbols simply don't get through.

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
