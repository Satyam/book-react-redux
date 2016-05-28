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

Container components extract the data from the store and provide the contained presentational component with the props it needs.  They don't display anything. Since they are relatively predictable in what they do they just need a few configuration objects.

Conversely, presentational components (since they don't know about Redux) do not dispatch actions.  They fire custom events, as our initial `Task` component did [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-06/client/task.js#L16-L19).  The container components are the ones that provide the presentational components with the listeners to those events and then dispatch the actions to the store.

To make it easier for us to write the data containers, we will use [React-Redux](https://github.com/reactjs/react-redux#react-redux) so we first have to load it.

```bash
npm i --save react-redux
```

So far, all our components that needed any data from the store needed to import the store instance from the `store/index.js` file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/store/index.js) which we added just as a temporary solution.  We may delete it now.

To make the store available to all data containers, we use the `<Provider>` component imported from React-Redux.  We import it from React-Redux as well as the method to create the store:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/index.js#L4-L8)

We export the created store to make it available for our test suite.  There is no need for the production code to have `store` exported, but it doesn't hurt performance in any way so, we might as well. We will do the same with several other elements within the application, just for testing purposes.

We wrap all our application in this `<Provider>` component which takes the `store` as its single property.  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/index.js#L14-L20)

In this case, we are wrapping the `<Router>` component which was our outermost component for the whole application.  If we didn't use Router or used some other router, we would have done the same with whichever React component that was the outermost one.

Just like `<Router>`, `<Provider>` produces no visible output, it will simply provide all our *container* components with access to the `store` in a way that does not require us to explicitly import the store instance in each and every source file.

Though components communicate with each other via the properties that they pass down through the hierarchy, sometimes it is good to have some information shared all across the application. That is when React's [context](https://facebook.github.io/react/docs/context.html) feature comes handy. Information set as *context* by one component will be available under `this.context` to all its children.  This is what `<Provider>` does, it makes the `store` available to any possible data container component anywhere in the hierarchy as `this.context.store`.

### Data containers

A quick search for `store` through the files in the `components` folder gives us a list of files that need data containers, namely  `projectList.js`, `projectItem.js`, `project.js` and `task.js`.  Presentational components should not even be aware of Redux or its store so those that currently do import `store` in the `components` folder must be changed.

We will use React-Redux `connect` method to wrap our presentational components with the Redux-aware data-container. It will help us with extracting the information the component needs and turning them into properties.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/components/project.js#L23-L37)

The `mapStateToProps` function extracts the values we need from the store. It receives the current `state` of the store and the `props` just like any other React component.  

The function should return an object that will be merged with the properties received from the parent component.  Here, we read the `pid` property from the Router as `props.params.pid` and use it to read the `project` property from `state.projects[pid]`.  Then we return all the properties `Project` needs, `pid`, `name` and `descr`.

The `connect` method uses `mapStateToProps` to produce a wrapper function which we immediately apply to the presentational `Project` component. It seems strange to go through this two-step process, why not a much simpler:

```js
export default connect(Project, mapStateToProps);
```

The reason is that `connect` is ready to be used as a [decorator](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.xwbj3lp0c), a proposal that didn't get into ES6 though it is planned for ES7, whenever that comes out.  At that time, when declaring `Project` we would *decorate* it with `connect`.

```js
@connect(mapStateToProps)
export default Project = ({ pid, name, descr }) => (
  //....
);
```


The new purely presentational `Project` component is now much simpler:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-15-01/client/components/project.js#L4-L15)

It does no longer care at all about the `store`, it gets the `pid`, `name` and `descr` as properties from the wrapper and returns the JSX for it. It first checks if there is a `name` as a signal that a project was found. A user might save the URL for a particular project as a bookmark or send it via email to someone else.  The project might be deleted so it might not be found when that saved URL is used later on.

We no longer export `Project` as a default.  We still export the component as a named export, along with `mapStateToProps` for testing purposes but now the default export is now the component wrapped by `connect`. However, components using `<Project>` won't notice the difference, whether `Project` reads the state from the store or uses `connect`, it really doesn't matter.

It is worth mentioning that the `connect` function does actually return a React component.  If we install a tool such as [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) in Chrome and look at the component hierarchy, we would see:

```
<Component(Project) .... properties .... >
   <Project .... properties .... >
```

__ use the active property in ProjectItem as an example:


Actually, the component wrapper that `connect` produces merges the object that `mapStateToProps` creates with all the properties it receives, such as the properties set by the Router. This  so in Project we could have read the `pid` from `props.params.pid` as we had before since the wrapper will let it through.


--- Drop the following:
Naming the function `mapStateToProps` is purely conventional, it doesn't even need to be a separate named function, the following would have worked just as well:

```js
import { connect } from 'react-redux';

export default connect(
  (store, props) => {
    const pid = props.params.pid;
    return {
      project: store.projects[pid],
      pid,
    };
  }
)(Project);
```

We have placed the data container wrapper within the same file because it is very tightly related to it. Some developers prefer to put them in separate files, however, we are following the usual convention of having only one component per file except for closely related purely stateless components, and now `Project` is such stateless component.

### Dispatching actions

`Project` had no actions to dispatch.  Since actions are dispatched on the store, our data container should also deal with them. We just need another mapping function: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/components/taskList.js#L55-L63)

```js
const mapStateToProps = (store, props) => ({
  tasks: store.projects[props.pid].tasks,
});

import { toggleCompleted } from '../actions';

const mapDispatchToProps = (dispatch) => ({
  onTaskItemClick: ({ pid, tid }) => dispatch(toggleCompleted(pid, tid)),
});
```

Besides the store to properties mapper, we map the dispatches to properties.  Our React components can have pseudo-event listeners, just like regular HTML elements have.  In this case, we expect our `TaskList` component to have an `onTaskItemClick` property which we must supply with an event listener function.  Following the convention, we use the `on` prefix for its name and we also expect to receive an event object with the arguments though this is not strictly needed, might have passed the `pid` and `tid` arguments as separate value arguments.

The mapping function receives the `dispatch` argument already bound to the `store` so we can immediately use it to dispatch the action.

We will use both mapping functions in our `connect` wrapper: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/components/taskList.js#L65-L72)

```js
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskList);
```

The `TaskList` component is no longer a sub-class of `React.Component` but a simple stateless function. [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/components/taskList.js#L26-L42)

```js
function TaskList({ tasks, pid, onTaskItemClick }) {
  const onTaskItemClickHandler = ({ tid }) => {
    onTaskItemClick({ pid, tid });
  };
  return (
    <ul className="task-list">{
      map(tasks, (task, tid) => (
        <Task key={tid}
          descr={task.descr}
          complete={task.complete}
          tid={tid}
          onTaskClick={onTaskItemClickHandler}
        />
      ))
    }</ul>
  );
}
```

`TaskList` receives `tasks` from the store mapping function, `pid` from `Project` because the wrapper passes through all the properties it receives and `onTaskItemClick` from the dispatches mapping function.  

`TaskList` relays the custom `onTaskClick` event it receives from the `Task` component as `onTaskItemClick` with the addition of the `pid` property.


Good as it sounds, unfortunately, this doesn't work quite as expected.  When we click on any task item, we will see the *pending* count on `ProjectList` change but the checkbox in the task item itself does not change.

The problem is that React-Redux optimizes the re-rendering by avoiding it when the values of the properties it would pass to the wrapped component are the same as they were before.  Here, the `tasks` object is always the same, its contents might change, but the reference to `tasks` remains the same thus, doing a shallow compare, the properties always look the same.  We can change this behavior with the `options` argument of `connect`: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-2/client/components/taskList.js#L65-L72)

```js
export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  {
    pure: false,
  }
)(TaskList);
```

We skip the third argument and then provide an `options` argument which is an object with several options. We set `pure` to false.  This means that the wrapped function is not pure in that it doesn't depend purely on the property values themselves but on something else.  The wrapper will then make no assumptions and won't prevent the re-rendering.

This fix is not good.  It is a symptom of something wrong.  A better solution is to separate the `Task` component, currently a stateless function within `taskList.js` and turn it into a Redux-wrapped component.

The `TaskList` component [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-3/client/components/taskList.js) is much simpler than it was before as it doesn't have to deal with providing `Task` with its properties nor of handling its events. Looking at the differences in between versions [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/commit/90c0a7626a8b549b54e7f3e9fc67b3e7c3307e5f#diff-e00bd86cff7cf70308f0b55dcd1f7913R3), we can see in red how much code has gone away.  Much of it has gone to Task but a lot has simply disappeared.  

Much of what is missing in TaskList has been moved to `Task` and its wrapper [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-3/client/components/task.js).

Worth mentioning is `mapStateToProps`: [(:octocat:)](https://github.com/Satyam/HowToDoATodoApp/blob/chapter-15-3/client/components/task.js#L28)

```js
const mapStateToProps = (state, { pid, tid }) =>
  Object.assign({}, state.projects[pid].tasks[tid]);
```

The mapper simply needs to return an object with `descr` and `complete` properties, which is precisely what a task has so by returning `state.projects[pid].tasks[tid]` that should serve as the map.  However, when deciding when to re-render, the wrapper would once again compare the previous object to the current one and they would be exactly the same object, though the  contents might have changed.  That is why we make a copy of it so it is not the same object, then it goes on to compare the values on the first level. At that point it would decide whether to redraw or not, which is what we wanted.

All this unnecessary cloning of objects is not good for performance, not the one in our single reducer.  In the next chapter, we will see how to improve this.
