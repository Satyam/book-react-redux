# The client-side application

Now we can complete the picture of our client side application.  We have seen the parts of the root `index.js` file that are related to the React components.  Now that we have the store defined and the means to create it, we can look at the rest of that file.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/index.jsx#L17-L23)

In an isomorphic app, the client will receive the initial state of the store as a JSON string within some element.  We try to get that element by its id and, if there is one, we read its contents and parse it.

Our imported `createStore` just needs that `initialState`, if there is one, and whatever flavor of history manager we want to use, in this case `browserHistory` which we imported from `react-router`.  That gives us the `store` which we pass to `Provider`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/index.jsx#L33-L39)

## Performance tools

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/index.jsx#L11-L15)

The [React performance tools](https://facebook.github.io/react/docs/perf.html) provides us with a profiler to determine where is our application wasting time. It doesn't make sense to install it in the *production* environment so we load it conditionally.  We are not using ES6 `import` statement because the transpiled would *hoist* that request to the main scope, thus, it would not import it conditionally, it would always do so, adding up to the production bundle.  That is why we have resorted to the `require` function which runs when and only if it is called.  We have to turn off the warning of ESLint to tell it that we really mean to do that.

We save the performance tools into a `Perf` global variable so that we can use its commands from wherever we want in our code.  The most important are:

* `Perf.start()` and `Perf.stop()` to start and stop the capture of performance data. This can be called from the console or placed around any section of code we want to analyze.
* `Perf.printWasted()` shows in the console a nicely formatted table of all the components that were called but didn't actually change the DOM.

The `shouldComponentUpdate` method which our components inherit from `React.Component` is the main tool for us to prevent unnecessary re-renders. Most of our components are stateless so we don't have access to `shouldComponentUpdate`.  On announcing *stateless components* the React team wrote:

> In the future, we’ll also be able to make performance optimizations specific to these components by avoiding unnecessary checks and memory allocations.

That future is not there yet and stateless components, lacking `shouldComponentUpdate` to decide whether to render or not, always do render. That is why `printWasted` lists them quite often. If performance is an issue and until that future arrives, it might be a good idea to turn them into stateful components so they can benefit from `shouldComponentUpdate`.

For an isomorphic client, we also check whether the markup sent from the server has been preserved.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/index.jsx#L41-L50)

We set the `BUNDLE` constant when we pack the code with WebPack. It identifies the kind of bundle the code has been packed for.  If it is a `client` bundle and we are not in *production* we check the `data-react-checksum` attribute on the first element within the container for our app. We do this after the app has been rendered.  The server-side markup will contain the `data-react-checksum`, the markup created on the client side, does not.  If there is still a `data-react-checksum` attribute, it means that the client accepted the server-side markup as valid and has not replaced it.

There is also a little addition for the Electron bundle [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/index.jsx#L27-L29) which we will see later on.

The `index.jsx` file is expected to run in the browser.  That is why it uses `window` and `document` so freely.  Those two globals would not be available on the server.  Some of the files that `index.jsx` imports, such as `createStore.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/store/createStore.js#L24) may run on either side, that is why they cannot count on `window` or `document` to be there and have to check it first.
