# React and Redux

We have used Redux in our React application but in a very basic way.  Actually, Redux is not a part of React at all and it might very well be used with other application frameworks.  It would be good if we could integrate them in a better way.

From our small application, we can see that there are certain parts that are repeated over and over.  We've seen that both `ProjectItem` and `Task` which were originally simple stateless components had to be turned into stateful ones ato be able to override three lifecyle methods provided by `React.Component`, namely `componentDidMount`, `componentWillUnmount` and `shouldComponentUpdate` and use the internal `state` and in both cases in very much the same way:

```js
componentDidMount() {
  this.unsubscriber = store.subscribe(() => this.setState(this.getXxxx()));;
}
shouldComponentUpdate(nextProps, nextState) {
  const s = this.state;
  return s.x !== nextState.x || s.y !== nextState.y;
}
componentWillUnmount() {
  this.unsubscriber();
}
```

In both of them we read the state from the store via `store.getStatus()`.

It would be great if we could go back to our original stateless components and let some other *something* deal with the data.  Enter [React-Redux](https://github.com/reactjs/react-redux#react-redux)

## React-Redux

What if we could split those stateful components we had to write into a simple stateless component as we had before, which deals with showing the data and another one that feeds it with the properties we need, taken from the store.

In Redux parlance, these two types of components are called *presentational* components or simply *components* and *container* components.  

Presentational components are usually simple functions, not classes, that do the rendering from the data they receive in their `props`, as our earlier components did. They don't even know Redux exists.  

Container components extract the data from the store and provide the contained presentational component with the props it needs.  They don't display anything. Since they are relatively predictable in what they do they just need little configuration.

Conversely, presentational components (since they don't know about Redux) do not dispatch actions.  They fire custom events, as our initial `Task` component did [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-06/client/task.js#L16-L19).  The container components are the ones that provide the presentational components with the listeners to those events and then dispatch the actions to the store.

To make it easier for us to write the data containers, we will use [React-Redux](https://github.com/reactjs/react-redux#react-redux) so we first have to load it.

```bash
npm i --save react-redux
```

So far, all our components that needed any data from the store had to import the store instance from the `store/index.js` file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/store/index.js) which we added just as a temporary solution.  We may delete it now.

To make the store available to all data containers, we use the `<Provider>` component from React-Redux.  We import it as well as the method to create the store:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/index.js#L4-L8)

We export the created store to make it available for our test suite.  There is no need for the production code to have `store` exported, but it doesn't hurt performance in any way so, we might as well. We will do the same with several other elements within the application, just for testing purposes.

We wrap all our application in this `<Provider>` component which takes the `store` as its single property.  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/index.js#L14-L20)

In this case, we are wrapping the `<Router>` component which was our outermost component for the whole application.  If we didn't use Router or used some other router, we would have done the same with whichever React component that happened to be the outermost one. To be precise, we have to wrap anything that might want to use the store, but we assume most of our application will.

Just like `<Router>`, `<Provider>` produces no visible output, it will simply provide all our *container* components with access to the `store` in a way that does not require us to explicitly import the store instance in each and every source file.

Though components communicate with each other via the properties that they pass down through the hierarchy, sometimes it is good to have some information shared all across the application. That is when React's [context](https://facebook.github.io/react/docs/context.html) feature comes handy. Information set as *context* by one component will be available under `this.context` to all its children.  This is what `<Provider>` does, it makes the `store` available to any possible data container component anywhere in the hierarchy as `this.context.store`.

### Data containers

A quick search for `store` through the files in the `components` folder gives us a list of files that need data containers, namely  `projectList.js`, `projectItem.js`, `project.js` and `task.js`.  Presentational components should not even be aware of Redux or its store so those that currently do import `store` in the `components` folder must be changed.

We will use React-Redux `connect` method to wrap our presentational components with the Redux-aware data-container. It will help us with extracting the information the component needs and turning them into properties.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/components/projects/project.js#L23-L37)

The `mapStateToProps` function extracts the values we need from the store. It receives the current `state` of the store and the `props` just like any other React component.  

The function should return an object that will be merged with the properties received from the parent component.  Here, we read the `pid` property from the Router as `props.params.pid` and use it to read the `project` property from `state.projects[pid]`.  Then we return all the properties `Project` needs, `pid`, `name` and `descr`.

The `connect` method uses `mapStateToProps` to produce a wrapper function which we immediately apply to the presentational `Project` component.

It might seem strange to go through this two-step process, why not a much simpler:

```js
export default connect(Project, mapStateToProps);
```

The reason is that `connect` is ready to be used as a [decorator](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.xwbj3lp0c), a proposal that didn't get into ES6 though it is planned for ES7, whenever that comes out.  At that time, when declaring `Project` we would *decorate* it with `connect`:

```js
@connect(mapStateToProps)
export default Project = ({ pid, name, descr }) => (
  //....
);
```


The new purely presentational `Project` component is now much simpler:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/components/projects/project.js#L4-L15)

It does no longer care at all about the `store`, it gets the `pid`, `name` and `descr` as properties from the wrapper and returns the JSX for it. It first checks if there is a `name` as a signal that a project was found. A user might save the URL for a particular project as a bookmark or send it via email to someone else.  The project might be deleted so it might not be found when that saved URL is used later on.

We no longer export `Project` as a default.  We still export the component as a named export, along with `mapStateToProps` for testing purposes but now the default export is now the component wrapped by `connect`. However, components using `<Project>` won't notice the difference, whether `Project` reads the state from the store or uses `connect`, it really doesn't matter.

It is worth mentioning that the `connect` function does actually return a React component.  If we install a tool such as [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) in Chrome and look at the component hierarchy, we would see:

```html
<Component(Project) .... properties .... >
   <Project .... properties .... >
```

The component wrapper that `connect` produces merges the object that `mapStateToProps` creates with all the properties it receives, such as the properties set by the Router.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/components/projects/projectItem.js#L18-L34)

Here, `ProjectItem.propTypes` lists four properties, however, `mapStateToProps` returns only two.  The other two, `pid` and `active` come from the parent component.  As a matter of fact, `mapStateToProps` itself reads `props.pid` and uses it to fetch the `project`, however, it doesn't need to return the `pid` as it is already there.

Naming the function `mapStateToProps` is purely conventional, it doesn't even need to be a separate named function, the mapper could have been provided to `connect` as an anonymous function defined on the spot.  However, giving it a separate name and, specially, exporting it as a named export makes it accessible for unit testing.

We have placed the data container wrapper within the same file because it is very tightly related to it, some separate the presentational component from the data container. This seems quite pointless as one doesn't make sense without the other.  The only possible reason to do that is to enable unit testing of the presentational component without the need to provide a working store but we already export the presentational component as a named export so it is accessible to testing software.

In the documentation for Redux, the author creates two folders, `components` that contains components that don't have access to the store and `containers` for those that use `connect`.  Though that separation is handy for the reader of those samples to easily find the *connected* files, there is no reason to do that in a production environment.  A *connected* component is used no differently than an *unconnected* one.  As long as its properties are well documented and are satisfied by the parent component, they just behave pretty much the same.

### Dispatching actions

`connect` also allow us to dispatch actions.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/components/projects/task.js#L43-L52)

Besides `mapStateToProps`, connect may take an optional second argument, usually called `mapDispatchToProps` that returns an object containing a series of custom event handlers that will also be merged into the properties of the contained component.

In this case we declare `onCompletedChange` which will receive a custom event object made of the `pid`, `tid` and `completed`.  Unsurprisingly, this custom event looks pretty much as the one we had several chapters back [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-01/client/project.js#L4), and it is used by the `Task` component in the same way:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/components/projects/task.js#L4-L12)

The `mapDispatchToProps` receives a reference to the `dispatch` method already bound to the store so it can be easily accessed via closure by the custom event handlers.  The handler simply has to dispatch the action produced by the `completedChanged` action creator function which it previously imported from `store/actions`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/components/projects/task.js#L46)

The `Task` component passed from being a sub-class of `React.Component` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/components/projects/task.js#L5-L40) being a simply stateless component [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/components/projects/task.js#L3-L21).

## Refreshing

We have seen earlier how to use the `shouldComponentUpdate` method of `React.Component` to tell React whether to bother to redraw the component or not.  Being able to do that offers a great performance boost.

React-Redux already does that for us. It does a shallow compare of the object returned from `mapStateToProps` with the previous version which it kept from before.  It also compares the properties it receives with their previous version.  It will redraw the contained component only if there has been any changes.

There are two important points to make here.  First is that the compare is a shallow compare.  `connect` will not detect changes in values deep in an object hierarchy and so the screen will fail to refresh.  That is why it is better to have `mapStateToProps` return an object containing simple values and not full objects with values nested deep inside them, as `connect` does not do an expensive deep compare.

Second, the first stage of that shallow compare is to see whether the objects are the same, that is, their references are the same.  Here is where the immutability of the store can be of great benefit.  If we manage to make `connect` compare object references, instead of the values contained within those objects, we can improve performance.

For example, in `Task`, we may switch from doing this:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/components/projects/task.js#L33-L41)

To this:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-02/client/components/projects/task.js#L33-L37)

In the first case we are returning a new object made of the same properties as the original. This new object fails the first check of the shallow compare since the references are obviously not the same, thus forcing the comparer to check the values.  In the new version, if we return the reference to the object in the store if the object references are the same, being immutable, the contents have to be the same.

It is not so easy to decide what to do with `TaskList`. Before we had:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/components/projects/taskList.js#L24-L26)

and now:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-02/client/components/projects/taskList.js#L24)

In the new version we are returning a reference to the project data in the store itself.  We only need the `tid`s  of the tasks in it for `TaskList` to iterate on them.  We are also returning the other properties of the project, such as the `name`, `descr` and `pending` count.  Should any of those change, the component would be redrawn as well.  The `name` and `descr` are unlike to change very often, but the `pending` count might.  Would this have a significant impact in the performance of the application?  The only way to know is to gather performance data with both versions, there is no way to know in advance.

We must definitely not do it in `ProjectList`.  We still have:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-02/client/components/projects/projectList.js#L31-L33)

We might be tempted to simplify it to:

```js
export const mapStateToProps = state => state;
```

The application would still work, however, right now our store only contains data about projects but that may not be so in the future.  `state.projects` is just one sub-store within the store, but there is a good chance we will have more and, if any of those stores change, `ProjectList` would be re-rendered even if nothing within our sub-store changed.  In this case, we must avoid trying to play the shallow compare in our favor because it will hurt us in the long run.

## Summary

We have used React-Redux to simplify access to the data in our store. By letting the `connect` method to deal with the store, we have greatly simplified our components which are, once again, stateless functions.

Though the main, default export for each of the source files is now the wrapped component which, for any parent component using it should be indistinguishable from the original one, we have also provided plenty of named exports to many elements within such as the original, unwrapped stateless component, `mapStateToProps` and `mapDispatchToProps`.  

These exports should allow us to test those parts of the separately from the whole wrapped component, which would require us to actually have a store.  To test the mappers, we only need simple stubs to stand in for the store.  If we test the unwrapped component and the mappers, we can be very certain the whole would work as the `connect` method is already thoroughly tested elsewhere.
