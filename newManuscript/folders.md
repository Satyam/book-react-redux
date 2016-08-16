# What is where

The application [(:octocat:)](https://github.com/Satyam/book-react-redux) contains six main folders plus those for the book itself (manuscript).

## The client folder

The `client` folder [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/master/client) contains all the files that will eventually get loaded in the client.  

The `index.jsx` file sets up the React / Redux / routing environment.  The `.eslintrc.json` file ensures the proper linting rules are used for the client-side environment.

Within it there are three further folders

### client/components

It contains the React components  [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/master/client/components). It has a couple of common files for the whole application, `app.jsx` contains the overall frame that will enclose the app and `notFound.jsx` the simple component that will show up if an erroneous, perhaps obsolete URL is provided.

We then have further folders for each of the main sections of the app.  In this example we have just one such section, `client/components/projects` but there might well be any number of them.

Each section usually contains a `routes.jsx` file that states how each component is activated depending on the path in the URL. We'll see its contents later on.

### client/store

It contains the Redux components [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/master/client/store).

The `createStore.js` file composes the various sub-stores into a single Redux store.  The `actions.js` consolidates all the action and action creators (more on them later) in a single include file.

The actual stores are each in a folder underneath. For simple stores, such as `misc` [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/master/client/store/misc) it is all contained in a single `index.js` file.  For more elaborate ones such as `projects` [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/master/client/store/projects) the various parts of the store are split into various files.

### client/utils

It contains various utility modules for both the React components and the Redux stores.  Alternatively, a `utils` folder might be created in each of `components` and `store`, however, some utility functions such as `initialDispatcher.js` help connect both components and store so, considering that in this example we don't have that many utility modules, we've piled them up here.

## The electron folder

Turning our client/server application into a Electron desktop application isn't hard, the proof being that we've done it with just three files [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/master/electron).  Admittedly, we haven't used any desktop-specific features such as the application menu, but doing so wouldn't be that big of an issue.

## The scripts folder

Most commands to compile, run or lint are simple enough to be contained within the `package.json` `scripts` entry so they can be run via the `npm run` command.  A few might require some extra help.  This folder might contain bash scripts or, in this case, plain JavaScript files for Node.js.

## The server folder

We will start looking at the server-side code in the very next chapter so we won't comment on the files in this folder right now.  As for the folders, there is an `isomorphic` folder that turns the regular client/server app into an isomorphic one.  Delete this folder and two lines in `server.js` and the application is no longer isomorphic.

The `projects` folder contains the server-side code to provide the data to the client-side store contained in a folder of the same name. Some of the stores on the client side do not require any server-side support, but those that do would have a folder for them.

## The test folder

It contains the scripts to test the code in each of the previous sections. Being so, it mimics the folder structure of them, there is a `client` folder containing a `components` and a `store` folder each containing further folders and files to test each element.

The `functional` folder contains a couple of functional tests.  Unlike the unit tests in the previous folders, which exercise each element independently of one another, this folder contains a couple of functional tests that test the overall functionality of a complete group of elements, in this case, the web server and the REST API manipulating the data for the `projects` store.

The tests are not complete.  We have done a few tests just to show how they can be written and which tools to use, but there is not one test for each and every element in the app.

The `utils` folder contains several handy modules to help in testing.

## The webpack.config folder.

Since we use WebPack to package all the bits and pieces of our app and we need several configuration files for the various environments, we placed them all in a single folder.  Thus we have one for development, one for production and one for testing.  They all share the `common.js` configuration.

## Other local folders

Once downloaded or cloned, the various scripts will create other folders which are not stored in GitHub because they are produced by the various scripts and contain no source material.  

The `bundles` folder will contain the packages created by WebPack, transpiled by Babel and, for the production version, minified, except the one destined for the client which will be located in a publicly accessible folder.

The `coverage` folder will be created when the `npm run coverage` command is issued.  It is produced by [istanbul](https://www.npmjs.com/package/istanbul) and we will look into it later.

The `public` folder contains whatever files might be sent to the client.  This is the virtual root for any URL received from the client. Background images, icons, static pages might be contained in it.  We have none of those but we do have a `public/bundles` folder that contains the packaged bundle destined for the client.

The `tmp` folder will be created by the script that executes the tests. It is deleted and rebuild every time the tests are run.  It might as well be deleted after the tests are successful but sometimes the web-packed files provide clues to some errors so it is best to leave them behind.

Finally, the `node_modules` folder contains all sorts of NPM modules as listed in `package.json`.
