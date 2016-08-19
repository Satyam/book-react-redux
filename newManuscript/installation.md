# Installation

The easiest way to get the code running in your machine is to [download](https://github.com/Satyam/book-react-redux/archive/master.zip) the ZIP file of the project from GitHub [(:octocat:)](https://github.com/Satyam/book-react-redux).

For those wanting to play with it and keep a copy of their changes in GitHub, making a fork and then cloning it locally might be a better option.  If you know what the previous sentence meant, you probably know how to do it.

The application only needs Node.js installed, which also installs NPM.

Once expanded into any folder of your choice, move to that folder and do a 'npm install' which will read all the dependencies from `package.json` and install them. This will take a while. There are no global dependencies in the project so the installation should not mess up with any folders outside of the project, except for the cache NPM maintains of the modules it downloads. The command `npm cache clean` flushes it but otherwise, NPM takes care of it.

## Available commands

Once in the root folder of the project, the following commands are available.

* `npm run build` Creates the developer versions of the bundles that can be executed.  This is the first command to run since very little of the code can be executed as-is.
* `npm run production` Creates the production versions of the same files.  The extra code used for internal checking within React is dropped and everything is minified.
* `npm run watch` Same as `npm run build` but WebPack remains loaded in the background and whenever any of the source files changes, the corresponding bundles will be re-created.
* `npm start` Starts the web server. A browser can then access the application by going to the URL that is shown in the console. Requires the application to be built.
* `npm run debug` Runs the web server in debug mode.  This command **does require** the [node-inspector](https://github.com/node-inspector/node-inspector) package to be installed globally and works with Chrome and Opera only.
* `npm run lint` Runs ESLint on all the source code.
* `npm t` Runs tests on the code.
* `npm run coverage` Runs the tests with code coverage via Istanbul.
* `npm run electron` Runs the Electron desktop version of this application.  Requires the application to be built.
* `npm run updateModules` Updates NPM modules to their latest versions.
