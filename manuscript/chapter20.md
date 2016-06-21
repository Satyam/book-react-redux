# Editing

So far we have mostly displayed information with no inserting or deleting and little editing, we have only changed the task completion status and even that was local, it didn't update the database. Basically, we were doing just queries.

We already have our server side REST API so to do all the possible operations on our database, we only need to call them from the client. So far, in `projects/actions.js` we only have `getAllProjects` and `getProjectById` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/projects/actions.js#L18-L49), we need to add one method for each of the other REST API operations [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/projects/actions.js#L51-L167).  It is too long and repetitive to show it here, but they all follow the pattern we've seen already.  They all return a function so they get detected by `redux-thunk` as asynchronous operations.  Each dispatches an initial action ending suffixed with `REQUEST` and then do the actual request with whatever parameters each one needs.  The Axios request returns a promise which we use to detect its success, upon which we dispatch the action suffixed with `SUCCESS` with the required data.

Since each of the actions requires three action types and they all follow a pretty similar pattern, we have separated the creation of the action types into a separate file:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/projects/actionTypes.js)

We compose both the named constants and the string they represent out of the prefix for the sub-store `projects`, the operation and the suffix for the stage.  We played a little trick when exporting the constants.  Since the ES6 `export` statement only allows for static exports, it is not possible to use it to generate named export dynamically so we collected all the exports into an object `constants` and then used NodeJS-style `module.exports` because that is what it happens internally.  The following two pieces of code are equivalent:

```js
export const foo = 1;
export const bar = 2;
```

```js
module.exports = {
  foo: 1,
  bar: 2
};
```

Since we created the action types dynamically, it is worth considering if we could not create the action creators dynamically as well, after all, they all look very much alike. This is discussed in the [Redux documentation](http://redux.js.org/docs/recipes/ReducingBoilerplate.html#async-action-creators) with an example of a possible implementation.  There are many possible implementations and none would teach us anything new.  We have already seen how to dispatch asynchronous actions and how to write middleware so we wouldn't be learning much by showing our own version nor by installing someone else's.

We made one noticeable change, the `completedChanged` action creator is significantly changed:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/projects/actions.js#L169-L180)

The original one dated to when we worked all synchronously on the client side.  It didn't update anything in the server.  We have now changed it to an asynchronous one, one the returns a function instead of an object. What sets this one apart from the rest is that instead of handling the REST API itself, it dispatches a separate action, `updateTask` to do the actual updating.  Since all our asynchronous action creators return a Promise, the one that Axios itself returns, we wait for that Promise to be resolved successfully and only then we dispatch our original action object.  We do this so we can keep an updated `pending` count locally, without being forced to recalculate it by querying all the tasks in the affected project [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/projects/projectsReducer.js#L18-L28).  

Both our `projectsReducer.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/projects/projectsReducer.js#L61-L82) and `tasksReducer` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/projects/tasksReducer.js#L23-L30) have grown to process the results of these extra actions. Our `projectsReducer` benefits from receiving some task-related actions [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/projects/projectsReducer.js#L69-L82) since it allows it to update its own list of child `tids` as well as the `pending` count.   Redux always sends all the actions to all the reducers.  At first glance, this might seem a waste of processing time, however, this is a clear example of the benefits of that feature.

## Dispatching the new actions

The `Project` component has grown from passively displaying information about the project and containing its list of tasks to have two buttons to edit the header information or delete the whole project.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/project.js#L13-L30)

We have used Bootstrap's [grid system](http://getbootstrap.com/css/#grid) to help with the layout.  A `<div>` element with className `row` encloses elements that are to go side by side.  Each child element has a `col-xs-`*n* className to distribute the space in that row.  Each row has 12 slots and the *n* says how many of those 12ths each section can use.  The virtue of the grid system over using `<table>` elements as we had to use in earlier times is that it responds much better to screens of different sizes, from large desktop screens to small smartphones.  When the screen gets too narrow, the row folds into multiple lines in a much predictable way.  This is determined by the two letters following the `col-` prefix, `xs`, `sm`,`md` or `lg`, with `xs` never folding.

The project information is now held in the left cell while the right cell is taken by two buttons to edit or delete the project.  Each of them calls its own handler.  A project is expected to have a `name` so that field is used to signal the project does exist. It might seem the `pid` would be a better choice but a user might use a saved URL with a `pid` that points to a project that no longer exists, hence, the page would have a `pid`, taken from the URL.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/project.js#L7-L12)

The two action handlers are very much the same.  Both check whether it is a plain click (left button, no modifier keys) and then call the custom component action with the corresponding `pid`. The `pid` is passed as an object instead of a single value.  The reason to do that is mostly standardization, DOM events carry the event information in objects so it makes sense for custom events to do the same.  An object also leaves room for growth, extra properties can be added at any time without affecting existing listeners.  Others merge the component properties with the DOM event object:

```js
const editClickHandler = ev =>
  isPlainClick(ev) && onEditClick(Object.assign({ pid }, ev));
```

This is fine for a UI component that is meant to be a better DOM element, for example, a `<SuperButton>` component that enhances the regular `<button>`, however, is not a good design for an application-oriented component. The rest of the application should not know about the DOM. It is the component that renders the DOM and it is the component that should take care of anything related to it, such as the DOM event.  If there is any other information in the DOM event object that might be of interest to the rest of the application, the component should extract, possibly pre-process any such values and then add them to the custom event object.  Or it might even fire a completely separate custom event, for example, a mouse click with the right button on a task might fire an `onContextMenu` custom event instead of `onCompletedChange` as it currently does.

The delete handler uses `window.confirm` which is quite an awful thing to do.  This is in no way recommended at all, but using any of the available modal overlay alternatives such as the one provided by [React-Bootstrap](http://react-bootstrap.github.io/components.html#overlays) would have required loading lots of extra packages and adding code that would not have provided any particular benefit for the purpose of this book.

We now have a `mapDispatchToProps` object:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/project.js#L56-L61)

Editing a project requires a completely different page so it dispatches the `push` action from `react-router-redux` to navigate to that page.  As a matter of fact, the same could have been achieved by using a `<Link>` instead of a button:

```html
<Link className="btn btn-default" to={`/project/editProject/${p.pid}`}>
  Edit Project
</Link>
```

The `<Link>`, however, would have limited our options to just navigating, going through the dispatcher in `mapDispatchToProps` allows for more flexibility as shown in the `onDeleteClick` callback.   We have pointed out earlier that all our asynchronous action creators return a Promise, the very same one that Axios returns. Redux doesn't really care about any such returned value, but it lets `dispatch` return it.  That is what allows us to chain a `.then` after we `dispatch` the `deleteProject` action:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/project.js#L58-L60)

Since the project has just been deleted, it would make little sense to return to this very same page to tell the user that the project is missing.  Of course it is missing, it has just been deleted!  So, on a successful `deleteProject`, we just navigate away from this page. If there had been any error with the `deleteProject` action, it would have been caught in the action itself [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/projects/actions.js#L93-L103) and this `.then` would have not been called.  We might have used this or any Promise returned from the async actions to issue notifications to the user such as a [snakcbar](http://www.material-ui.com/#/components/snackbar).

To handle editing a project, we have added a couple of routes:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/routes.js#L8-L14)

We will use the same `EditProject` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editProject.js) component to both add, when the route is `/projects/newProject` or edit an existing one for `/projects/editProject/:pid`.
After so much insistence on the benefits of stateless components over stateful ones, it seems strange that both editing components are stateful. There is a good reason for that to be so. Input elements such as `<input>`, `<textarea>` and `<select>` keep the user input within the DOM, however, in a dynamic application, the page could be refreshed at any time, perhaps due to an asynchronous action elsewhere.  If these elements are redrawn, they lose whatever the user might have entered so far. Since the DOM is volatile, they need their values to be preserved elsewhere and a stateful component is the perfect place for that.

## Rendering a stateful form

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editProject.js#L24-L57)

We use a couple of input fields and a couple of buttons with classNames imported from `editProject.css` [(:octocat:)]() which in turn point to Bootstrap's styles for form elements and buttons.  We must use the pseudo-attribute `htmlFor` instead of `for` in the `<label>` elements because `for` is a reserved word in JavaScript and it confuses the JSX pre-compiler (the same happens with `className` instead of `class`, another reserved word).

Each `<input>` element has its `name` set to the value they represent.  They both have their `onChange` event set to a listener to detect any changes.  Their `value`s are taken from `this.state.`*whatever*.  The `onChangeHandler` constantly preserves any change in either input element in the component state using the element `name` property to identify each:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editProject.js#L14-L17)

By preserving the values of the input elements in the component `state` we ensure that they are not lost if the page is accidentally refreshed.  Admittedly, a change in one section of the page should not refresh components elsewhere, but it may still happen.

Saving the input values in the state has other benefits.  Values could be formatted on the fly, for example, a space could be added every fourth digit in a credit card number. Values could be validated on each keystroke as well, before saving them into the state, for example, a message text could be truncated to the first 140 characters.  Values can be transformed in between their formatted representation to show to the user and the internal representation to be used internally within the application. That is why, on submitting the form, we are sending the values from `this.state` and not from the input fields:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editProject.js#L18-L20)

The rest of the application should not be concerned about which kind of element we have used to request the information, whether it is a simple text box or a full-blown calendar component that returns a Date object, it is important that, when the entered values are send out from the component, they are in an application-oriented format.

In our form, we disable the submit button when the `name` field is empty:

[(:memo:html)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editProject.js#L45-L49)

The component is declared as a new class which extends `React.Component`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editProject.js#L8-L13)

In the `constructor` we call `super` to pass on the `props` to `Component` and then set the initial `state` to the `name` and `descr` properties which we `pick` from `props` with the `lodash` utility of that name.  The `props` contain other values, but we don't want to pointlessly fill up `this.state` with information we don't really need. For example, since this component is a direct child of a `<Route>`, it will receive very many properties so we must be choosy.  We only pick the values needed for our input elements.

Calling `bindHandlers` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/utils/bindHandlers.js) comes next. The problem is that event handlers such as `onChangeHandler` are not called in the context of the component, that is, the `this` for an event handler is usually useless. To solve this, event handlers need to be bound to the context of the component. This should **never** be done in the `render` method, where the event handler is assigned, because the `render` method may be called many times (in this example, at least once per keystroke) and on each execution a new bound copy would be created quickly trashing the browser memory with these bound functions until the garbage collector kicks in.

 `bindHandlers` is just one of many recipes we can find out there. It looks for any own methods (not inherited) that start with `on` and end with `Handler` and binds them all to `this` just once when the object instance is created.  Thus, it will bind `onChangeHandler`, `onSubmitHandler` and `onCancelHandler`.  Actually, `bindHandlers` takes a second, optional argument that should be a regular expression with the pattern of the method names to be bound and it defaults to `on`*XXXX*`Handler` if none is specified.

To submit or quit editing we have the following as handlers for the corresponding buttons:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editProject.js#L18-L23)

In both cases we are checking it is a plain left-mouse button click and calling the corresponding custom event listener with the current state if it corresponds.  This is the place to do any final conversion of the data from its external representation, for example, a string representing a date, to its internal one, such as a Date object.

Though `EditProject` is a stateful React component and it could deal with the store directly, it is still quite convenient to rely on the `connect` method of `react-redux`.  Both, `EditProject` and `Project` use the same data so it should not be surprising that instead of copying them, we import `mapStateToProps` and `initialDispatch` straight from `project.js` [(:octocat:)]().  We modified the originals just a little bit to allow them to provide defaults when a project is about to be added and does not yet exist, but it gives us the benefit of testing and maintaining just one set of functions.

We do have to define a new `mapDispatchToProps` because the actions to be dispatched from `EditProject` are clearly different from those in `Project`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editProject.js#L71-L87)

Both have to branch of to different actions depending on whether `pid` has a value or not.  The first implies an update, the second, an addition.  When canceling, on an update we return to the project that was to be updated, otherwise we simply go to the project list.  We use the `replace` action from `react-router-redux` instead of `push` because, since we canceled, we don't want the browser history to remember we wanted to edit.

In the `onSubmit` handler we dispatch either `updateProject` or `addProject` and upon a successful return we go to show the updated or newly added project.  For the added project, since we didn't have a `pid`, we read it from `respose.data.pid` as it is the database that will provide the `pid` from the newly added record.

The `Task` component has grown to handle two more actions besides toggling the `completed` flag. It has two new event handlers, `onTaskEditHandler` and `onTaskDeleteHandler`

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/task.js#L6-L23)

The new events are fired by clicking on a couple of icons added to each task.  Since tasks can be numerous, it seemed better to use small icons instead of a full-size buttons.

[(:memo:html)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/task.js#L48-L55)

The event handlers call the dispatchers in `mapDispatchToProps`.  `onCompletedChange` now sends all the information for the task because it eventually will have to call `updateTask` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/projects/actions.js#L169-L180) and has to give it all the information.

`onTaskDelete` simply dispatches `deleteTask`.  It has to give it the `pid` so `projectsReducer` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/projects/projectsReducer.js#L76-L82) can delete the `tid` for this task from its `tids` array. It also needs to provide `completed` so it can update the `pending` count.

`onTaskEdit` dispatches `setEditTid` which is a new action acting on a new reducer:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/misc/index.js)

It all adds up to simply adding a `editTid` property into a new sub-store we call `misc` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/store/createStore.js#L7) for *miscellaneous* which eventually might collect some other minor status information that doesn't deserve a whole sub-store.  `editTid` either contains `null` if no task is being edited, or the `tid` of the one being edited. This works along `TaskList`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/taskList.js#L5-L16)

If the `tid` of the task to be listed matches `editTid`, it uses `EditTask`, otherwise, it uses `Task`.  Also, if not task is currently being edited, it adds an `EditTask` with no `tid` attribute which allows adding new tasks.

It is important when creating multiple instances of a control such as the `Task`s in `TaskList` that each should have a `key` pseudo-attribute set to a unique value within the list to identify each instance.  React users this `key` to know whether it needs refreshing.  In `TaskList` we can clearly see the advantage.  As any of the `Task` instances can be replaced by `EditTask`, if they were not individually identified with the `key`, React would have little alternative but to redraw them all.  With the `key` it can know which `Task` instance has been replaced by `EditTask` and which ones remain and don't need redrawing.

This brings us to `EditTask` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editTask.js) which follows the same basic structure as `EditProject`, even to the point of sharing `mapStateToProps` with `Task`.  Just a few details deserve highlighting.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editTask.js#L81-L90)

We use the `tid` property to determine if it should update an existing task or add a new one.  It dispatches either `updateTask` or `addTaskToProject` depending on that.  We use the same `tid` to determine if we are in edit mode [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editTask.js#L29) and change the style of the submit button [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editTask.js#L51) to show either a check-mark or a plus sign (or whatever the graphics designer might choose).

After dispatching any of the actions, we dispatch `setEditTid` sending it back to `null` so the edit box goes away.

Finally, in the `onSubmitHandler` we have:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-20-01/client/components/projects/editTask.js#L17-L24)

Here it is worth highlighting how important it is to keep returning the Promises returned by the actions dispatched.  We have already chained to the `.then` part of the Promises to navigate one place or another or to make the task edit box disappear.  Here, we are going one step further.  We have returned the Promise all the way back to the even handler, not just in `mapDispatchToProps` as we've done so far.  The reason for doing so is that when adding a task, the same instance of `EditTask` is used over and over again so we want to empty the input box to have it ready for a new task.  We do that with `this.setState` but  `mapDispatchToProps` has no access to `this` so it had to go all the way back to the event handler.

There are two points to make here:

* Use Promises, you can keep chaining and chaining plenty of useful code into them
* Always return Promises in asynchronous actions and keep returning them.  The `dispatch` method returns them for our benefit and we should keep returning them higher up.

Whenever we call `dispatch` on an asynchronous action we are either explicitly returning whatever it returns or leveraging the *fat arrow function* implicit return.
