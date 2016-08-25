# React Components

React Components range from the very tiny to somewhat complex ones though never  *'very complex ones'*. If a single component is very complex it means it is trying to do too much thus it should be broken into several simpler components.

Each component takes care of producing a small section of the UI of an application. We need to compose them to build the whole application. We will see how several of them work, each with a higher degree of complexity.

Components can be stateless or stateful.  Stateless components are made of a simple function that receives a series of arguments called *properties* usually abbreviated to `props`, and returns the expected representation of the little piece of UI it deals with.

## Stateless Components

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/notFound.jsx#L1-L16)

The `NotFound` component is a simple stateless component. It receives a `props` object which contains a bunch of information provided by the parent component, in this case the [React Router](https://github.com/reactjs/react-router).  It returns very simple HTML with a text message containing the path that was not found. React Router handles navigation within a Single Page Application. It can be told which parts of the application to render depending on the URL and it can also be told what to do when no route matches the requested path. The `NotFound` component was configured to be used in such a case.

`NotFound` is written in [JSX](http://facebook.github.io/jsx/), a syntax closely associated with React but not really restricted to it, for example, [MSX](https://github.com/insin/msx) can be used with [Mithril](http://mithril.js.org/).

Though files containing JSX usually have a `.jsx` extension, this is not mandatory at all and, actually, many of our tools have to be told to read `.jsx` files as plain JavaScript with some extra.

JSX allows inserting HTML/XML-like code into a JavaScript source code file though, of course, the resulting mix cannot be interpreted directly as JavaScript but has to go through a compiler to produce actual JavaScript code.  The compiler looks for an expression starting with a `<` symbol. In JavaSript, the *less than* symbol is a binary operator, that is, it sits in between two expressions, so no expression could possibly start with it because it would be missing the left-hand-side part. If there could be any doubt about whether a `<` is binary or unary, enclosing the JSX in between parenthesis disambiguates it since after an open parenthesis, there can only be an expression.

JavaScript expressions, not statements, are allowed within JSX, they have to be enclosed in between curly brackets `{}`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/notFound.jsx#L3-L8)

Our `NotFound` component receives `props` as an argument and, since it uses a *fat-arrow function* it implicitly returns what follows. It returns a `<div>` enclosing a heading and a paragraph showing the path that was not found.  To insert the path within the JSX code, we enclose it in curly braces.

React provides a mechanism to ensure the properties received by a component are of the expected types:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/notFound.jsx#L10-L14)

We can add a `propTypes` property to any component and list each of the properties within the `props` object and [their types](https://facebook.github.io/react/docs/reusable-components.html#prop-validation). The code that does this validation will only be included in the *development* version of the app, it will be completely stripped out in the *production* version.

It doesn't really matter whether the `props` were supplied by a component such as React Router as in this case, or by a component of ours.  React will always warn about properties within `props` that are not declared or are of the wrong type.  There is no need to declare all the properties, just the ones we use.  React Router provides plenty of information, we only declare those we use.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/app.jsx)

React component may include in their JSX code other React Components besides plain HTML. React expects all components to have their names starting with uppercase while plain HTML tags should always be lowercase. React Components can have attributes just like HTML elements can. The `Menu` component receives a `menuItems` attribute:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/app.jsx#L11-L15)

Though we use an HTML-like style to define attributes, in JSX, the values are not restricted to plain strings. In this case, `menuItems` receives a JavaScript object. There is no need to serialize it into a JSON string as it might happen with a `data-xxx` attribute in HTML.  That is also the reason for the double curly brackets `{{ }}`, the outer set of brackets is to switch from JSX mode into plain JavaScript and the inner set are those of the object literal.

Here we are importing the `Loading`, `Errors` and `Menu` components from the `_components` [virtual location](#conventions-virtual-import-paths) and using them just as we would use any other HTML element.

We are using the `children` property which is also provided by React Router.  `children` is validated as of type `React.PropTypes.node` which represents any kind of React component.

Routes in the browser behave differently than routes in the server. In the server, the first route that matches the requested path gets called and it sends via `res.send` the information back to the client.  There is no nesting, the first match does it all. We are not talking about middleware here, which can do some processing and pass on the request for others to deal with. On the server side, the first `res.send` or its equivalents, ends the operation. This is because the response to an HTTP request is a simple stream.

Routes in the client are meant to affect a two-dimensional screen where each part of the route might influence a particular section of it.  For example, most web pages will have a standard look, starting with an enclosing frame with the basic color scheme, perhaps the company logo, a copyright sign and so on.  Within that frame there might be other standard sections such as a header or footer, perhaps a menu or tabbed interface and finally, there will be one or more sections that are totally dependent on the route.  For example, a mail-client program will have a main section that contains the list of folders for the `/`, a list of messages in the inbox for `/inbox` or a particular message for `/inbox/de305d54-75b4-431b-adb2-eb6b9e546014`.   Each responds to a fragment of the full URL and they all combine to build the full screen.

![email program layout](routes.png)

The image above shows how the different parts of the URL bring up different sections on the screen layout for such application, with each section dealing with a little bit more of the URL and enclosing the more specific section. That is why client-side routes are hierarchical and why one component may have a variable `children` that might be assigned by the Router. It is like a place-holder for whatever subordinated content there might be.

## Connected Stateless Component

Stateless components, as it name implies, do not contain any state. However, they can access state information held by others, such as data from the Redux store. The `Loading` component [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/loading.jsx) is one such.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/loading.jsx#L6-L14)

As any stateless component, it is a simple function which receives some properties.  Since we are interested in `props.loading` we use ES6 *Object Destructuring* to get just `loading` extracted from `props`, plus *shorthand property names*.  This is not React or JSX, it is plain ES6.

The `Loading` component has a simple `div` containing a text message when anything is loading from a remote source.  It has a `className` attribute.  React accepts almost all HTML attributes, but has a few exceptions.  The `class` attribute would mess up JSX parsing because `class` is a reserved word in JavaScript and so is `for`.  That is why in React, we [should use](https://facebook.github.io/react/docs/dom-differences.html) `className` instead of `class` and `htmlFor` instead of `for`.

We are composing the `className` attribute via the [`classNames`](https://www.npmjs.com/package/classnames) utility, which allows us to easily concatenate various class names from different sources, some of them conditionally.  That is what we are doing with the `{ hide: !loading }
` part.  `classNames` will add the name of the property `hide` to the list of class names depending on the truthiness of its value which, in this case is the inverse of the boolean value of `props.loading`.

The `loading` class name is just a common practice. When inspecting the HTML it is an easy way to identify which element is which, otherwise, all of the `<div>`s really look alike. With so much of the HTML produced dynamically through React Components, it is difficult to associate the resulting HTML with the code we have written. The [React Developer Tools](https://github.com/facebook/react-devtools) do this for us, but they only work in Chrome and Firefox and not at all with the static HTML produced in the server via isomorphism. It is a debugging aid not required in production and might be omitted.  

The `hide` class name comes from [Bootstrap](http://getbootstrap.com/css/#helper-classes-show-hide).  

The `styles.loading` class names comes from the following include:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/loading.jsx#L4)

Importing CSS files is a feature provided by WebPack's [CSS-loader](https://github.com/webpack/css-loader).  The `loading.css` file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/loading.css) is a normal CSS file. WebPack can also pack CSS and load them on the client.  An interesting feature of such loading is that the CSS-loader generates unique class names for the included classes, excluding any possibility of name clashes.  The CSS-loader also understands [CSS-modules](https://github.com/css-modules/css-modules) and optionally translates identifiers invalid in JavaScript such as those with dashes: `my-class-name` to JS-compatible camel-case: `myClassName`

In this example, `styles.loading` might contain `_3ZmMd6h2aKqY_GEJqAEiQN` and the `client.css` bundle generated by WebPack will define the style for that unique identifier.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/loading.jsx#L16-L18)

We declare the type of the `loading` property within `props` to be a boolean.  All these type-checking code disappears automatically when building the *production* version so there is not cost in the final product.

We didn't call our component `Loading`, as the file name suggests, or the way we imported it in `app.jsx` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/app.jsx#L4) but used `LoadingComponent` instead. That is because our default export is not `LoadingComponent` but a wrapped version of it.

## React-Redux

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/loading.jsx#L20-L26)  

We might have several requests pending at any one time from various sources. It is not practical for all those possible sources to know how to notify the `Loading` component when they start a request or receive a reply. We could use some sort of global event system, but that would be messy.  Instead, we use the [Redux Store](http://redux.js.org/docs/basics/Store.html) to do so.  Also, we cannot use a simple boolean flag, we need instead to count pending requests.  When there are any pending requests it means the `loading` status is true, when it comes down to zero, `loading` is false.

`mapStateToProps` is a customary name for a function that receives the `state` of the Redux Store and returns an object that maps the values currently in the store into the name of the `props` that the React component will receive.

The `connect` function from [react-redux](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) merges whichever `props` the component is already receiving from its parent with those provided by `mapStateToProps` and calls `LoadingComponent` whenever the store changes.

`connect` returns what is called a *High-order Component* or HoC.  It is a true React Component which has the wrapped component as its only child. It is invisible to the user, it adds nothing to whatever its child renders. As a regular React component, it receives properties from its parent, it then merges them with those coming from the store thanks to `mapStateToProps` and calls our stateless `LoadingComponent`.  The latter does not need to care about Redux or its store, it just receives a plain `props` object with all it needs to know to do its simple duty.  The HoC also subscribes to the store to receive notifications of any changes so that it knows when to redraw the wrapped component.

We export the wrapped component as the default because, for all any other component might ever care, the wrapped component is just as good as the stateless `LoadingComponent`. No other component should really care whether a component is wrapped by a HoC or not.

> We diverge from the example given in the [Redux documentation](http://redux.js.org/docs/basics/UsageWithReact.html) in that we don't separate *presentational* from *container* components into different folders. *Container* components are those wrapped with `connect`. The author clearly states in the [FAQ](http://redux.js.org/docs/FAQ.html#structure-file-structure) that there is no preferred structure for a project using Redux and lists several options. We see no benefit in separating wrapped components from simple ones.  As we will see later, there can be many HoCs and we cannot allow those HoCs to define the structure of our project.

> Though we export our wrapped component as the default, we still export `LoadingComponent` and `mapStateToProps` as *named* exports. The React application itself would only care for the *default* export, however, for the purpose of unit testing, it is good to have the other *units* exposed to be able to test them individually.  We don't really need to test the full connected component.  If the plain, un-connected component works and `mapStateToProps` works, it is safe to assume `connect` will do its work.

## Router HoC

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/menu.jsx#L30)

In `menu.jsx` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/menu.js) our default export is also a wrapped component.  In this case, we use the `withRouter` HoC from React-Router:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/menu.jsx#L2)

The `withRouter` wrapper from React Router adds a `router` property to the `props` argument of the wrapped component. We use the `router.isActive` method to know which tab in the menu to highlight as active.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/menu.jsx#L6-L23)

`MenuComponent` produces a tabbed navigation bar.  It accepts the `menuItems` object which contains a series of unique paths as property names and the caption for the corresponding tab.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/app.jsx#L12-L14)

It creates an un-ordered list of list items which, thanks to [Bootstrap Tabs](http://getbootstrap.com/components/#nav-tabs). We are not using Bootstrap prescribed class names in our code.  We could use [pills](http://getbootstrap.com/components/#nav-pills) instead of [tabs](http://getbootstrap.com/components/#nav-tabs) since the actual style definitions are in the imported `menu.css` file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/menu.css) which uses [CSS-modules](https://github.com/css-modules/css-modules) to compose them out of the Bootstrap styles.  If we change the composition of styles from `nav-tabs` to `nav-pills` or to whichever classes another library might use, we change the look of the menu.

Since `menuItems` is not an array but an object, we resort to [Lodash](https://lodash.com/) `map`function which works in both arrays and objects. Lodash is a large library and loading the whole of it for just one or two functions would be too expensive.   Many such libraries have been modularized.  Instead of importing everything from the library and using parts of it, we can request only what we will use.  So, instead of doing `import _ from 'lodash';` and then using the `_.map()` function, we can import just the `map` function:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/menu.jsx#L3)

When using the `map` function, instead of doing `menuItems.map( ... )` as we would do if it was an array, we do `map(menuItems, ... )`.  The callback receives the property values and property names, which we call `caption` and `path`.  Depending on whether the path is active, via `router.isActive(path)` we display either an inert link (it has no `href`) with the `styles.active` style.  The `<a>` element is just because Bootstrap (or any other styling library) expects one otherwise it won't look right.

For the rest of the links, we use a `<Link>` component which we also import from React Router. This component produces an actual `<a>` so Bootstrap can be kept happy, but ensures that React Router will catch that request for navigation and process it itself.

Note that we are returning an array of `<li>` elements.  The `map` function returns an array of whatever the callbacks return and the callback is a *fat arrow function* which implicitly returns the value of the expression in it.  That expression is a ternary conditional expression retuning either kind of link.

Whenever we have an array of items such as the `<li>` elements in this component, it is important that we assign each of them a `key` pseudo-attribute containing a unique id within the array (the ids might and will probably repeat over and over in an application, they just have to be unique within each array).  React uses this pseudo-attribute to identify each item even as its contents or attributes change, otherwise, React wouldn't be able to know if an item with a different content is meant to be a different element or the same element with its contents changed. It becomes particularly useful when elements are inserted or deleted because it allows it to actually insert or delete just that element from the DOM instead of re-render them all from the mismatched element on. We must ensure the `key` is a permanent and lasting id for the element, not just a sequentially assigned integer which changes in each render, that would be as bad as not providing any `key` at all.  

As expected, the types of the `props` are declared both as objects:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/menu.jsx#L25-L28)

## Dispatching Actions

We have seen how we can reflect the state of the store in a connected component but, so far, we haven't seen how we can affect the store in response to an action by the user.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/errors.jsx#L8-L22)

`ErrorsComponent` receives an array with a list of `errors` and it simply displays it after chaining them together via`{errors.join('\n')}` in an overlaid box only when the length of the list is not zero.

The box contains a button to let the user acknowledge the error and clear the error list.  Upon clicking on that button, `closeErrorsHandler` is called which uses the `ev` event object to check whether the click was a plain left-button click with no modifier keys (shift, control and such)

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/utils/isPlainClick.js)

`isPlainClick` checks the `ev` object for the corresponding properties and returns false if any is non-zero or true.  If the click is a *plain* one, it prevents the default action associated to the event and returns true.

In that case, the component calls `onCloseErrors` which it received as a property (destructured from the `props` object). We used the `on` prefix to mark it as an event listener as with DOM event listeners.  Just like `errors` is produced via `mapStateToProps` from the Redux store, so `onCloseErrors` is produced by `mapDispatchToProps`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/errors.jsx#L33-L35)

`mapDispatchToProps` is a function that receives a reference to the `store.dispatch` method.  This is the method through which we notify the store that something has happened. When using Redux, we only maintain one store so when we `dispatch` something, it can only go to one place.

`dispatch` dispatches *actions*, which usually are objects containing all of the information needed for the action to be performed. Those objects may be complex to assemble so, to make it easier, we use *action creators* which assemble them for us.  We will learn more about *actions* and *action creators* in a moment, for the time being it is enough for us to know that `clearHttpErrors` is one such *action creator*, thus, we are dispatching the *action* that the `clearHttpErrors` *action creator* has assembled for us.

Just as `mapStateToProps`, `mapDispatchToProps` returns an object that will be merged along the rest of the `props` received from the parent.  Both are exported by name for testing purposes and the types of both sets of properties have to be declared:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/errors.jsx#L24-L27)

Though it was not used in this case, `mapDispatchToProps` also receives a reference to the same `props` the component would receive, to help it assemble the *actions*.  `mapDispatchToProps` (not the functions it returns) will be called again whenever the `props` change so that the returned functions are bound to the most recent properties.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/master/client/components/errors.jsx#L37-L40)

`mapDispatchToProps` is used as a second argument for the `connect` method that wraps our simple stateless component with the HoC.

We have split the functionality of dispatching the action into two functions, `closeErrorsHandler` and `onCloseErrors` and it might seem redundant because it could have all be done in just one place, checking the event with `isPlainClick` and then dispatching the action all in `onCloseErrors` and completely drop `closeErrorsHandler`.  We prefer to have the UI-related functionality within the component itself.  Checking to see if the button was left-clicked assumes you expect a click, but some other interface design might use some other kind of user interaction.  Since the component determines the way the user can respond, it is the component that should be responsible to verify it.

At a later point, the range of interactions with a particular screen element might grow, we might have it behave in one way when left-clicked and another when right-clicked.  Would it make sense to the left vs. right click verification in the `mapDispatchToProps`? Hardly.

Note also that the `ev` event object never leaves the component itself. The component deals with the DOM and the DOM should never spill out of the component to the rest of the application.  All our custom pseudo-events should be application-oriented, not DOM-related.  If they were to have any arguments passed, they should be related to the application, not to the DOM.  Even just passing on the `ev` object to our custom event might cause an unexpected dependency in the future as someone might use some property in it for whatever purpose, thus prevent the user interaction from changing from clicking to *blinking while staring at it*, or whatever future user interfaces might offer.
