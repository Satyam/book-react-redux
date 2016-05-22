# Events

Our simple App shows existing information but does not allow us to change it in any way.  To do that we first have to respond to events from the UI.

Regular DOM events provide us with information about the DOM element involved and additional information such as which mouse button was used in a click, which key was pressed with which modifiers, the cursor coordinates and much more.  However, when we develop our own components we should define what information might be of interest to the developer who is using that component and satisfy those expectations.  

Take our Task component [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-12-03/client/project.js#L4-L8).  Could anyone possibly care the precise [x,y] coordinates of the cursor within that component when the item is clicked? Or weather the element was clicked, touched, stared at or thought about?  It would be far more important to provide the `tid` of the task and its new completion status.  Thus, we might define our `onCompletedChange` custom event object having just a couple of properties, the `tid` and the new value for `completed`. In this way we translate a DOM event closely related to the browser environment into an abstract application-oriented event with information suitable to higher level components.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-01/client/project.js#L4-L16)

We change the argument list of our `Task` component to receive extra properties, `tid` and `onCompletedChange`.  Actually, `Task` is still receiving a single argument, an object usually called `props`, short for *properties*. We are adding a couple of names of the properties we are destructuring out of that single object.

First, we define an `onClickHandler` for the DOM `onClick` event. The `onClickHandler` function will receive the `ev` DOM Event object. We check if the event was triggered with any mouse button except the primary one, or modified with the shift, alt, meta or control keys.  If any of those conditions is true, we simply return and do nothing.  Otherwise, we call `ev.preventDefault()` to signal the DOM that we are taking care of that event and that the default action, whatever that might have been, does not need to be invoked. So far, all these operations are closely related to the DOM and the browser environment. Finally, we call the `onCompletedChange` callback we received as an argument providing it with an object with the `tid` of the task clicked and the new value for `completed`.  This object is the application-oriented event object, it contains no browser information.

As before, the `Task` component returns the actual elements to be rendered much as we did before, except that we are adding an `onClick` DOM event handler to the `<li>` element.  We have also dropped the checkbox we used before to represent the completion status in favor of changing the `className` of the list item.  This is, in fact, a far more flexible alternative as it gives the graphic designer more options, even simulating a checkbox, via CSS. Consequently, we have added a CSS file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-01/public/index.css) which we included in `index.html` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-01/public/index.html#L6).

To make it work, we have to modify the `TaskList` component to provide `Task` with the new arguments.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-01/client/project.js#L25-L39)

We define a trivial handler that simply sends to the console the event object it receives, augmented with the `pid`.  No browser-related information is handled at this point.  The `Task` component provides the `tid` because that is what it deals with, one simple task.  Components higher up may augment this with more information, such as the `pid`.

Now, we must provide the `<Task>` component with the new `tid` and `onCompletedChange` properties. The list of pseudo-HTML-attributes has grown so large that we had to spread it into multiple lines.  The `propTypes` for `Task` has also grown:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-01/client/project.js#L18-L23)

It is important to notice that the way we use the `onCompletedChange` attribute of the `<Task>` component looks very much like a DOM event such as the regular `onClick` attribute on the  `<li>` element, we just assign a callback function that will be called when the expected event happens. Both callbacks will receive an object which will contain suitable properties.

As we click on the tasks within the project, we will be able to see in the browser console the messages from our handler.  They won't show if we press any of the modifier keys or use any button but the primary one.

We have responded to the UI event signaling the intent of the user to change the completion status of the task but we haven't done that yet.  It should be pretty easy just by changing the event handler in `TaskList`:

```js
const onCompletedChangeHandler = ({ tid, completed }) => {
  tasks[tid].completed = completed;
};
```

We are once again using destructuring to take the `tid` property out of the event object.  It is easy to set the completion status since `TaskList` has a reference to all the tasks in the project. Of course, we are reading and changing all this data from an in-memory copy of `data.js` so all changes are purely local and volatile, but we will get to that in a moment. Now, the problem is to refresh this new state in the UI.

One way to do it would be to call `render` again as we did in `router.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-01/client/router.js#L11).  It will work but it is a little too extreme!  It would be fast for a small application such as ours but it makes no sense for anything larger.

React uses a *virtual DOM*. It keeps a very succinct version of the DOM in memory as it was rendered the last time. Lets call this the *existing* copy.  When it does a refresh, React produces a new version, the *expected*.  It then compares the *expected* against the *existing* version.   When it finds a difference, it only sends the minimum of commands to change the DOM to reflect the expectations.

Changes to the DOM are expensive, specially if they involve a re-flow of the whole page.  Producing the *expected* version and comparing it against the *existing* is relatively cheap, however, it is not free, it does take some effort, less than re-rendering the full DOM but it still takes time.

If we can tell React what has actually been changed, React can do much less work.  To do that, we need our components to remember their previous state and know when that state has changed.  So far, we have used *stateless* components, we need to go to *stateful* ones.


## Stateful components

Stateless components are simple functions that receive a series of properties and return whatever should be rendered.   Stateful components are classes derived from `React.Component`.  Lets convert our `Task`  stateless component into a stateful one. Just as we did with `PropTypes` we extract `Component` as a separate import from `React`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-02/client/project.js#L1)

Instead of a simple function, our `Task` component is now a class:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-02/client/project.js#L4-L12)

As all classes, it has a `constructor` which receives the `props` argument.  Before doing anything else, it is important to call the constructor of the parent class, in this case, `React.Component`.  We do this by calling `super(props)`. React.Component needs to receive those properties for its internal workings.

React knows when to render a component based on its internal state.  It the state has changed, it assumes it needs re-rendering.  This doesn't mean it will completely regenerate the DOM for this component, what it will do is to create that *expected* in-memory image which, at some point, it will compare to the *existing* image and, wherever they differ, it will issue the appropriate DOM commands.

One of the tasks of the constructor is to set the initial state of the component.  We do this by setting `this.state` to an object containing the relevant properties.  We only use `descr` and `completed` for the state.  The `tid` is the primary key for the task so it should not change and doesn't need to be part of the possibly changing state.  The `onCompletedChange` property shouldn't change either.

Finally, we `bind` the event handler to `this`.  As with all event handlers, whether DOM or custom ones, when the handler is called, it is called in the context of the caller or with no context at all.  This means that the handler would not have access to the `this` of its own class.  We use that handler in the `render` function and we might bind it there, when it gets used but, as the `render` function may be called lots of times, it is better to bind it just once in the constructor. Repeatedly calling `bind` does not only waste time but it leaves behind a small piece of memory allocated for each bound function and those bits end up trashing the memory space and forcing more work on the garbage collector.

The `render` function is very much like our earlier stateless component:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-02/client/project.js#L22-L31)

The main difference is that instead of reading `descr` and `completed` from the argument list, it reads them from `this.state.descr` and `this.state.completed`.  Also, it uses `this.onClickHandler` instead of accessing `onClickHandler` via closure as it did before.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-02/client/project.js#L13-L20)

The handler itself does the same.  Instead of accessing the `onCompletedChange` callback via closure, it reads it from `this.props.onCompletedChange`.  It does the same with `this.props.tid`.  That is one of the visible effects of calling `super(props)` in the constructor, React will copy all the properties received into `this.props`.  We read `completed` from `this.state.completed` instead.  There is a copy of it in `this.props.completed` just as there are for `tid` or `descr` but these copies do not reflect possible changes in the state of the component, they will always retain their original values and won't be affected by whatever the user does.

Thus, as a general rule, those properties that the user might change via some interaction with the UI, be it clicking, touching, typing or whatever, must go into `this.state` in the constructor and read from there.  The ones that don't change over the lifetime of the component, can be accessed from `this.props`.

How do we change the state of the component?  Via `this.setState`.  Except in the constructor, where the state is initialized, we must never set `this.state` or anything within it directly.  We should always do it via `this.setState`. This function actually merges the values given to the existing ones.  In our case, we only set `completed` but that doesn't mean we are wiping out `descr`, we are merging the new value of `completed` into the object which also contains the value of `descr`.

When React detects changes in its state, it triggers the re-rendering process. If we now run this version, we will see the task items switch color as we click on them.  However, though we have changed the state of the component, we have not changed the underlying data itself.  That is why we are still firing the `onCompletedChange` custom event to notify to whomever it might concern, that the change has been requested.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-02/client/project.js#L41-L43)

The `TaskList` component itself listens to that event and its handler, adds the `pid` and fires its own `onTaskCompletedChange` event.   The `Project` component listens to this event and finally changes the actual data.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-02/client/project.js#L64-L66)

Of course, it only changes the local client-side copy of `data.js`, not the shared one on the server, which we will do later on. It is easy to tell the changes have been preserved by clicking on some of the tasks to change its completion status, selecting another project and then, when going back to the original one, the changes are still there.

### Stateless or Stateful

Stateless components are to be preferred over stateful because, besides being cheap in resources taken, state machines are harder to test and debug.  Calling a stateless component with the same properties will always produce the same output.  In a stateful component, it all depends on the previous state, thus the chances for bugs increases and so does then need for tests.

However, to let React know when a component has changed and, if so, to trigger a re-render, said component needs to know what its previous state was so it can compare it with the new one.  That is why we had to go to a stateful component, that is, a JavaScript class instead of a plain function.

`React.Component` also provides a whole series of methods for particular needs and what they call [lifecycle events](https://facebook.github.io/react/docs/component-specs.html) such as `shouldComponentUpdate` which allows for a finer control on when the component might need re-rendering.

## Putting some order into our files

Our project has grown a little wild, some components are not where they should.  It is customary that components should be each in its own file, except for stateless components when they are totally subordinate to the main component in the file, like `ProjectItem` is to `ProjectList`.

The `App` and `NotFound` stateless components which were within `router.js` now have their own separate files `app.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-03/client/app.js) and `notFound.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-03/client/notFound.js).

The `NotFound` component now informs which path is the one that has not been found.  It gets this information from the Router which provides the component with plenty of information about how it got there.

The `App` component is now a true frame providing some real options, well... at the moment, just one, listing the available projects.  At this point we are using a plain `<Link>` component which renders as an HTML anchor `<a>`.  In a real project, it might be a menu or a tabbed interface.  What it still has from before is a placeholder for the children it will contain: `{props.children}` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-03/client/app.js#L7).  This is important.  Whenever there is a `<Route>` which contains nested `<Route>` elements, the parent component should have a `{props.children}` placeholder to put the contents of the components in the nested routes.  Failing to provide such a placeholder will not issue an error nor warning, the children will simply not be rendered.

Our earlier `index.js` file is now `projectList.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-03/client/projectList.js) because it actually contains a component called `ProjectList` which lists the available projects. Likewise, the component imported as `Index` in `router.js` is now `ProjectList` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-03/client/router.js#L5). Early on, `index.js` was the entry point of our pre-React application and that is why it received the default name for an entry-point. That is no longer the case.

The `project.js` file contained too many components, even a stateful one, which should have been on its own.  Now it is much smaller containing a simple stateless component [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-03/client/project.js) with the `TaskList` and `Task` components moved into their own files `taskList.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-03/client/taskList.js) and `task.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-03/client/task.js).

We have also changed the routes:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-03/client/router.js#L11-L20)

We have `App` as an overall container.  It has the main menu, though at this point it has only one option, listing the projects.  This `App` menu will show if its own path or any of the subordinated paths are matched.  Since one of those paths is `'*'` which shows the `NotFound` component, `App` will always have a match, even if it is `NotFound`.  That is why we are no longer using `IndexRoute`.

If the route is `/project` or `/project/:pid`, the `ProjectList` will show.  Once again, it will show with either its own path `/project` or upon matching any subordinate route `/project/:pid`.  Notice how the nested paths get concatenated in the actual URL.

In our earlier version, we either had the projects list or the information about a single project.   In this version we have a hierarchy of information starting at the main menu, followed by the projects list and then, if a project is selected, information about it. The nesting of the routes reflects this.

## Conditional rendering

We have something that doesn't look nice.  Once a project is selected and its details shown in the bottom panel, the projects list still shows as a link, even though that project has already been selected.  It would be good to highlight the selected project and drop the link around it.

We can easily do this by using the `params` property that the Router provides our components.  `params.pid` will be the actual `pid` of the selected project or `undefined` if no project has been selected yet.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-04/client/projectList.js#L21-L36)

We then add an `active` property to the `ProjectItem` component.  We set it by comparing the `pid` parameter in the route to the `pid` of the project being rendered.  If they are the same, then we are rendering the active project.

We use that extra `active` property in two conditional expressions within `ProjectItem`.  One of them adds a `className` to the list item and the other decides whether to show the plain name for the active project or a link to navigate to it.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-04/client/projectList.js#L5-L13)

We do something very similar in `App` since, once we have clicked on our single menu item, there is no point in keeping it as a link [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-04/client/app.js#L4-L13).

Lets go a little further.  Why don't we add a count of pending tasks along the list of projects?  We will provide an extra numeric `pending` property to `ProjectItem` so we can show it along each of the project names. We calculate it in `ProjectList` like this:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-05/client/projectList.js#L32-L36)

We use `Array.filter` over each of the tasks in each project to select those which are not yet completed.  Then, we count how many they ended up being.  It might not a good piece of code but it won't last long.  It is there just to show one issue.

We just show that count for each of the items:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-05/client/projectList.js#L5-L13)

As we click on the tasks for a particular project, though the marks on the checkboxes change indicating their completion status, the counts of *pendings* on the projects list don't change at all.  However, if we click on a different project, then the pending counts suddenly get updated to their correct values.

The problem is that though we are updating the data and we are telling `TaskList` to re-render itself by changing its state, this does not apply to components higher in the hierarchy.  Clicking on any of the project links re-renders them and then the counts are updated.

This was meant to be a simple example of a deeper issue which we will fix this in the next chapter, namely, that it is difficult to keep in sync different views of the same data.

## Lodash

After seeing all those calls to `Object.keys`, it is time to wonder if there is anything better.  The problem is that though Arrays have `.map`, `.reduce` and `.filter` methods, Objects don't so it is harder to loop over its items. Fortunately there are libraries of utilities to solve this.  One of the best is [Lodash](https://lodash.com/) an improved version of [Underscore](http://underscorejs.org/) which was named like that because it was usually named with the underscore `_` symbol.

To use Lodash, we first need to download the package:

```bash
npm i --save lodash
```

We may load the whole package like this:

```js
const _ = require('lodash');
```

The examples shown in the documentation of Lodash assume we've loaded it in this way, which makes all of the dozens of functions available at once.  However, this would make WebPack include the whole library in the bundle. A better option for us is to include only the parts we need:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-13-06/client/projectList.js#L4-L5)

We can clearly see the benefits of Lodash looking at this same segment in both versions side to side:

<table><tr><th>Before  <a href="https://github.com/Satyam/book-react-redux/blob/chapter-13-05/client/projectList.js#L26-L38">:octocat:</a> </th><th>After <a href="https://github.com/Satyam/book-react-redux/blob/chapter-13-06/client/projectList.js#L28-L40">:octocat:</a></th></tr>
<tr><td><pre><code class="lang-js">
Object.keys(data).map(pid =>
   (&lt;ProjectItem
     key={pid}
     pid={pid}
     name={data[pid].name}
     active={params.pid === pid}
     pending={
       Object.keys(data[pid].tasks).filter(
         tid => !data[pid].tasks[tid].completed
       ).length
     }
   /&gt;)
 )
</code></pre></td>
<td><pre><code class="lang-js">
map(data, (prj, pid) =>
  (&lt;ProjectItem
    key={pid}
    pid={pid}
    name={prj.name}
    active={params.pid === pid}
    pending={
      filter(prj.tasks,
        task => !task.completed
      ).length
    }
  /&gt;)
)</code></pre></td></tr></table>

It is worth noting that [`map`](https://lodash.com/docs#map) and [`filter`](https://lodash.com/docs#filter) work indistinctly in both Array and Objects or, as they are called in Lodash, *Collections*.
