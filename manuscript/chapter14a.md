# Rearranging the files

Our `/client` folder [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/chapter-14-02/client) is in a quite sorry state.  It has been handy so far to have everything under the same roof, but it has no future.

How to arrange the various source files in an application is always a matter of much discussion.  This is not helped by the fact that the otherwise excellent [Redux](http://redux.js.org/index.html) documentation uses an arrangement that is clear for learning Redux but is not useful for a production environment.  Developers start with that structure and soon get stuck, even though the Redux FAQ [clearly states](http://redux.js.org/docs/FAQ.html#structure-file-structure) that Redux "... has no direct opinion on how your project should be structured" and refers to several such discussions. The following is just one of those alternatives.

## The `components` folder

We will create a `components` folder to put all React components together [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/chapter-14-03/client/components) separate from those dealing with the store.  

We have two groups of components, those generic ones like `app.js` and `notFound.js` that apply to the whole application, and the rest that are specific to handling projects.  The later we put in a folder `client/components/projects` [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/chapter-14-03/client/components/projects).

Besides this `/projects` folder we would eventually have other folders for other branches of our application and we would surely have a folder with common or shared components that show up here and there around the whole application.

When moving things around like this, import statements with relative references from one file to another become messed around. Suddenly, the `../whatever` doesn't work any longer and it should become `../../whatever`. It all becomes very hard to manage.  

WebPack uses a *resolver* to figure out how to solve the path given in an `import` statement or `require` call. By default it uses the same rules as NodeJS.  For locations that don't start with `./`, `../` or `/` it assumes they refer to packages in `node_modules`.  We cannot use references starting with `/` since we don't know where our developers would download or clone our package.

We can set up aliases for the resolver.  That lets us put our own application files on an equal footing as those from external modules.  

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/webpack.config.js#L20-L25)

With these aliases, WebPack will no longer try to locate `components/app.js` in `node_modules/components` but will apply the alias and resolve it to `client/components/app.js`.

By the way, we have added some constants to help us define those paths:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/webpack.config.js#L1-L3)

ESLint, though, will complain.  We set our local `eslintrc.json` configuration file to follow the `airbnb` rules. Those rules include checking out that the files mentioned in `import` statements do exist. On its own, that rule-checker does not know about WebPack resolver aliases. To fix that, we need to add another package:

```bash
npm i --save-dev eslint-import-resolver-webpack
```

And add a setting to our ESLint configuration file to tell it to use that import resolver:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/.eslintrc.json)

Now, we don't have a single relative reference to an imported file starting with `../`.

### Dropping the file extension

We have dropped all the `.js` extensions in our imported files.  Both NodeJS and thus WebPack already assume a `.js` extension. However, the reason is not to spare us typing time.

Lets imagine we have a `components/bigstuff` branch in our application and that one of the components, `components/bigstuff/bigComponent.js` has become very big and we want to break that source file into several pieces.  Or, shall we say that the component needs some other asset and we don't want it to lay around mixed up with other components.

If we import the component as:

```js
import Biggie from 'components/bigstuff/bigComponent'
```

by omitting the `.js` extension on the `import`, we are free to move things around.  We move `components/bigstuff/bigComponent.js` to `components/bigstuff/bigComponent/bigComponent.js` and then rename it to `components/bigstuff/bigComponent/index.js`.  Suddenly we have a whole folder to put our extra assets in, or break our bigComponent into as many pieces as we want.  All our `imports`, such as the one above, will still work just the same.  WebPack will go from loading `bigComponent.js` to loading the `index.js` file under the `bigComponent` folder and the rest of the application won't notice the switch.

### Delegating routes

We don't need to state all our routes in just one place, we may delegate them, specially if they are more-or-less self-contained branches of the application:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/routes.js#L7-L14)

Instead of getting the main route configuration file involved in the inner workings of that branch, we delegate it to that branch:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/components/projects/routes.js)

Should we later add features to this branch or re-order the existing options, we don't need to go to the top level to fix it.

## The `store` folder

We also create a `store` folder to put all the Redux-related code. As seen earlier, we have already created an alias for WebPack's resolver to reference this folder [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/webpack.config.js#L22).  We will create a further `store/projects` folder for the actions and reducers related to our projects which, for the time being, are the only ones we have.  We will call these *sub-stores*.

### Actions

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/store/projects/actions.js)

The `actions.js` file has changed a little bit.  First of all, in order to ensure unique action-type strings, we prefix the string with the name of the folder it is under.  We don't need to add a prefix to the identifier for that action because actions end up all collected together and the name collision would be detected when building the package.

We have also added an *action creator*.  The `completedChanged` function makes it easier to assemble the data into the action object.  It doesn't seem a big gain at this point but some actions are a little more complex so it is better to use action creators [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/components/projects/task.js#L24) instead of simply use the action type and assemble the action object in the component itself as we had before [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-02/client/task.js#L24-L29).

### Reducer

Most of our earlier `store.js` file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-02/client/store.js) is now in `reducer.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/store/projects/reducer.js).

In Redux, there is a single store which can be made out of many sub-stores, each with its own reducer. Reducers can be defined for specific parts of the application, but there can only be one store.  That is why we are separating the reducer for the projects, which goes into `projects/reducer.js` and the creation of the store, which goes elsewhere, as we will see shortly.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/store/projects/reducer.js#L6-L14)

The `data.js` file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/store/projects/data.js) only contains data for projects so it should go into the `projects` folder as well.  Instead of initializing the whole store with its data, we initialize it via the reducer. If a reducer is called with an `undefined` state, it should return the initial state. We use ES6's *default parameter value* feature to set the value for `state` if it is `undefined`.  When Redux initializes, it goes through all its reducers with an empty state to ensure they are all initialized.  

### The `index.js` file

We create a `projects/index.js` file to consolidate this sub-store into a single export:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/store/projects/index.js)

On the one hand we re-export all our named action-type constants and action creator functions and export the reducer as our default export.

In a small sub-store such as this, we might put everything in a single `index.js` instead of re-exporting the bits and pieces from other files. Either way, the rule should always be:

* Each folder should have an `index.js` file which may either contain the code itself or re-export the contents of other files in the folder.
* The *reducer* should be the default export.
* Action type constants and action creator functions should be exported as named exports.

## Consolidating the store.

### Actions

The `store/actions.js` file consolidates the actions of all the sub-stores:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/store/actions.js)

Since we have a single sub-store, it simply re-exports all it finds there. We would keep adding lines like this one for each sub-store we add.

### Creating the store

As we can only have one single store, we first need to combine the reducers for each sub-store:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/store/createStore.js)

We do that with the aptly named `combineReducers` function.  We may import any number of sub-stores just as we did with `./projects` and combine them all together into a single big reducer.  The reducer for each sub-store will deal only with its branch of data within the single overall store.

When combining the reducers, we are using the [shorthand property name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Property_definitions) feature of ES6.  In ES5 we would have written:

```js
const reducers = combineReducers({
  projects: projects,
});
```

The argument to `combineReducers` is an object and since the property name matches the name of the variable holding the reference to the reducer, we can use the shorthand, however, this also allows us to rename the branch the `projects` sub-store would be in:

```js
const reducers = combineReducers({
  prjs: projects,
});
```

Finally we export as a default a function that creates the store via `createStore` using the reducers we have just combined.

Since now the data for the projects is in a sub-store, we have to change the components to access them from within the correct branch:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/components/projects/projectItem.js#L20-L22)

Earlier on we had:

```js
return store.getState()[this.props.pid];
```

If we had renamed the branch when combining the reducers, we should have used that name instead.  We do the same for all components using the store.

### Some left-over

The `store/index.js` file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/store/index.js) is a temporary patch for this particular version. It allows the components to reach the store quite easily, however, it will be gone shortly.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/components/projects/task.js#L3)

## What's left at the top

We should expect that as our application grows, the possible routes to reach the different parts of it will also grow. That is why it deserves to have a separate file for itself:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/routes.js)

We import the various components from wherever they are and set the routes to reach each of them.  Notice this includes only the definition of the routes, not the initialization of the router itself. We do that, along with doing the initial render and, in the future, any other initialization in `index.js`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/client/index.js)

Since now that is our initial entry point, we have to change it in `webpack.config.js` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-14-03/webpack.config.js#L6)

## Why separate components and store

Looking at the `components/projects` and `store/projects` folders, it is fair to ask whether it wouldn't make sense to put the components, actions and stores for `projects` together in a single folder as a *sub-system*.  

The reason is that there is often not a one-to-one relation in between components and sub-stores.  Different pages within the application may combine different components to provide various views of the data in different sub-stores, for example:

* A component, directly or through sub-components, might show bits and pieces of data from different sub-stores.
* An action generated by a component might affect more than one sub-store.
* A sub-store might contain data shown by several components in different parts of the application in various ways.

## Summary

We have restructured our files in a way that allows for growth.  We have separated our components per branch (at the moment only one, `projects`) with space for other branches elsewhere.

We have broken down our single store into sub-stores and combined the reducers to make a single overall store, even though at the moment we have only one sub-store.  It is easy to add other sub-stores under this mechanism.

We have learned to configure WebPack resolver to accept aliases to make it easy to refer to our source files in various locations and told ESLint to recognize those aliases as well.

By dropping the `.js` extensions in the `import` statements we gain some liberty in moving our files into separate folders should they grow large or require other assets.
