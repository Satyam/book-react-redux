# Stateful Components

So far we have seen stateless components which are simple functions that returns a visual representation of a section of a page, based on a series of properties it receives as its arguments. If the properties change, the representation changes, if they don't, it doesn't. Stateless components are very predictable.  They hold no internal state that might make them respond in different ways to the same set of properties.

In contrast to that, stateful components do hold state.  To do so, first of all, they are declared as JavaScript classes so that their instances can have a `this` context.  They have two main properties, both objects containing several keyed values:

* `this.props` are the very same properties stateless components have. They come from components higher up in the hierarchy.  A component should never change the properties it receives.
* `this.state` holds the internal state of the component. It is created within the component and managed by it.

The classic example of a stateful component is a form.  When initially called the component will receive, amongst other possible properties, the values of the fields to be edited in the form.  These properties do not change over the lifecycle of this particular instance of the form component.

As the fields in the form are filled, the visual representation of it will change.  Input fields will be filled in or edited.  As fields are validated, error messages might show. Calendars might pop up to help in filling in dates. Action buttons might become enabled as the data changes.  During all of this process, `this.props` never changes while `this.state` does so continuously.

Stateful components are created by extending the `React.Component` class. They can still be created by calling `React.createClass`, as most documentation about React shows and both mechanisms are very much alike, however, since we are using ES6, we will stick with the *class* instead of the *factory* way.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/editProject.jsx#L13-L18)

We declare the `EditProjectComponent` as a class that extends `React.Component` (we extracted the `Component` export from the `React` library on importing it [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/editProject.jsx#L1)).   Its `constructor` receives the `props` just as the stateless components did. After calling the constructor of the super-class it sets the initial `state`.  Then it goes to bind its own action handlers, something we will see later after dealing with the `state`.

## State

The `state` should only hold information that is meant to be changed during the lifetime of this component. The `props` might contain lots of other information, such as `onXxxx` custom event handlers, strings for headings and even routing information.  We should avoid cluttering `state` with all this extra information, we should just pick from `props` that which will change and we do so by using Lodash [pick](http://devdocs.io/lodash~4/index#pick) function, extracting just the `name` and `descr` properties, which we intend to edit. We might also initialize other `state` properties by merging them with the ones picked from the `props`.

We should never set `state` directly, **except** in the constructor, this is the only time we will see `this.state` on the left hand side of the assignment operator. We can read directly from `this.state` but never write into it, except in the constructor. Later changes to `state` should be done via the `setState` method, as we will see later.  `setState` not only changes `state` but also signals React that something has changed and so the component might need a re-render. `setState` queues a re-render, which will not happen immediately and, in certain circumstances, it might not happen at all or it might be subsumed within a wider redraw. React takes care of optimizing this and we might help by declaring the [`shouldComponentUpdate`](https://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate) method.  As always, it is never a good idea to start by over-optimizing so, we will leave `shouldComponentUpdate` alone.  Should a performance test show a particularly slow component, then we can use `shouldComponentUpdate`.

`state` will contain an object with multiple properties.  `setState` expects an object with new values for just the properties that need changing. It will **merge** (never replace) the object it receives with the object it has already stored.  

`state` will usually contain a relatively *flat* object, just a set of key-value pairs.  A deeply nested hierarchy of objects is usually a sign that the component is dealing with too many things and might need breaking up into several, smaller, simple components. Besides, it is the Redux Store the place to deal with the bulk of data.

## Event handlers

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/editProject.jsx#L19-L28)

We identify our internal event handlers with the `onXxxxxHandler` pattern.  Some of them, `onSubmitHandler` and `onCancelHandler`, after checking that the click was a plain one, that is, left button and no shift, alt or ctrl keys, it calls the external event handler received along the rest of the `props`. Neither passes on the `ev` event object out of the component, as we have already discussed at the end of the previous chapter. If we pass any arguments out of the component, they should be application-related, like in `onSubmitHandler` which passes `this.state` that should contain an object with only `name` and `descr` properties, which is all the outside world should care about from this component.  Should the `state` contain anything else, as it often happens, then we should `pick` whatever is relevant.

To make sure `onSubmitHandler` can pass the true state of the form at any time, we should keep `state` updated at all times.  That is what `onChangeHandler` does.  We attach `onChangeHandler` to every input field in the form.  We name the input fields by the name of the property they affect so, a single handler can deal with all of them.  We get a reference to the input field from `ev.target` and then we use the `name` and `value` of that input field to set its state.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/editProject.jsx#L21)

Two important differences in between React's virtual DOM and the real DOM:

* The `onChange` event is fired whenever a field is changed, not just when the focus leaves the field.  Each and every keystroke or paste into a field changes it thus listening to the `onChange` event provides a continuously updated image of the field.
* All input elements have a `value` property, even `<textarea>` and `<select>` and they provide what you would really expect.  This standardizes the way to access their value regardless of their type.

We could have attached a separate handler for changes in each of the two fields but thanks to the above item, we can manage with only one.

We have to be careful with field validation. When using real DOM, we might run a full-field validation when the user moves the focus out of a field by listening to `onChange`.  This is not the case with React when `onChange` fires while the field is still being edited.

We will attach all the handlers above to the events in the buttons and input fields in the form. The problem with doing so is that event handlers are called in the context of the element that fires it, that is, the `this` for the handler is the DOM element, which has no `this.setState` method.  That is why the handlers must be bound to the `this` of the instance of `EditProjectComponent`.

There are two ways to do it.  When creating the element we might do:

```js
onChange={this.onChangeHandler.bind(this)}
```

This is not a good idea because the component might be re-rendered many times, as a matter of fact, it will be re-rendered on each and every keystroke.  Each call to `bind` leaves behind a bit of memory and, even though they are deleted as anew bound copy is created, we would be leaving behind a lot of trash for the garbage collector to dispose of.  Instead, we bind them all just once when the instance of `EditProjectComponent` is created with the `bindHandlers` function:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/utils/bindHandlers.js)

We have already called it in the `constructor` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/editProject.jsx#L17).  `bindHandlers` looks within an object for properties that are functions and follow the naming pattern `onXxxxxHandler` and binds them to that object.  The naming pattern can easily be changed by passing a second argument containing a regular expression.  It doesn't work on inherited methods which, presumably, should have been bound in their own constructors.

## The render method

Finally we reach the `render` method [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/editProject.jsx#L29-L61) which is very much alike our earlier stateless components, the difference being that `render` receives no arguments, this, it has to read the values from either `this.props` or `this.state`.  For example, the `name` field:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/editProject.jsx#L29-L61)

Its `value` is set from `this.state.name` and its `onChange` event listener is set to the already bound method `this.onChangeHandler`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/editProject.jsx#L50-L54)

We can easily enable/disable the `Ok` button by checking the length of `this.submit.name`, which is the only mandatory field.  Since the `state` is constantly updated on each and every keystroke by the `onChange` listener, the enabled state is updated continuously.  That is not completely true, React's internal representation of the DOM will be updated but, if there is no change, the actual DOM attribute will not be changed.

Note that we are not using the `<form>` `onSubmit` handler, though the handler is called `onSubmitHandler`, we are listening to the click on a simple button. As a matter of fact, there is no actual `<form>` element in the *form*, just a collection of fields, labels and buttons nicely formatted with the class names in the `styles` object.

## The exposed event handlers

As with stateless components, we generate the external event handlers with `mapDispatchToProps`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/projects/editProject.jsx#L72-L88)

The same component serves both to edit a project as well as for adding a new one, the difference is that when editing an existing project, the project already has a `pid` while new ones don't.  In both `onSubmit` and `onCancelEdit` we first branch off to different dispatches, an `updateProject` if there is `pid` or `addProject` for a new project.  Note also how we chain further actions after the update or addition of the project.  By adding a `.then()` to the first dispatch, we are navigating away from the editor.  If it is an existing project, we already have the `pid` but, if it is a new project, we find out the `pid` it got assigned from the reply to the `addProject` action.

We have not defined a `mapStateToProps` function for this component because we are using the very same one from `project.jsx` by importing it.  That is one more reason to always export those functions, besides doing unit-testing on them, we can reuse them in related components.

For the time being, we will ignore `initialDispatch` and `initialDispatcher` which help ensure that the component has its initial data set to display. We will look at them in depth when we deal with isomorphism.

## (Un)controlled components

There is a discussion in the React documentation about controlled and uncontrolled components.  The one we've seen is a controlled component, so called because React is always in control, by listening to its changes and redrawing it all the time. Uncontrolled ones are simply left to run free, no `onChange` listener, no setting of its value from `this.state`.  An uncontrolled component might well be rendered by a stateless component, as all its state actually resides in the DOM itself.  However, by having no control over the form, we would be unable to do sophisticated things with it via React.  In an uncontrolled form, setting the enabled state of the `Ok` button or doing on-the-fly validation would require some extra scripting or using JQuery or similar tools, which would be a pity.  

Another issue with uncontrolled components is that the state is stored in the DOM and thus be lost if React re-renders the component.  This should not happen as React always tries to reduce the changes to the DOM and there is no reason why a change anywhere else in the page should force a refresh in an unrelated component. If an uncontrolled component gets its fields wiped out, it usually means there is a problem elsewhere.

If none of the above is an issue, there is something we do need to take care in uncontrolled components. In general, we should not set the `value` of an uncontrolled component.  React provides us with an extra pseudo-attribute called `defaultValue`.  This is the value that the field will be set to when it is not already set, that is, when it is initialized.  This is one more way in which React can preserve what the users has typed in an input field if the component gets refreshed.  The `defaultValue` would be used only when the field is rendered the first time.
