## Code coverage

In the previous chapter, we made a brief list of some of the things we had not checked in our test script.  Those are the *known unknowns* which is bad enough, but then, as expected, there are the *unknown unknowns*.  

As exhausting as writing all those tests might have been, they are not yet as exhaustive as they should be. That is because we have not covered all the alternatives.  There are two great subsets of errors, the application logic errors, most of which we have checked and others we haven't, such as those we listed towards the end of the last chapter.

Then, there are coding errors, most of which we have already checked, but several might lay hidden in code that rarely executes, which not even our tests have exercised.  In a compiled language, most of those are discovered at compilation time, but in an interpreted language, if one particular piece of code is never reached, it might never cause the application to fail.  A Linter certainly helps but, as compilers, they are only static checkers, they can't know what the value of the variables are going to be at the time of execution. So, the best alternative is to actually exercise each and every part of the code.

Plenty of times, we check conditions in our code to make sure we only proceed when things are fine.  We may or may not have an *else* for those conditions that are invalid.  We tend to think linearly, we rarely cover all the alternatives in our minds.  What happens when those *elses* run?   Quite often, we even forget to check them.  That is exactly what we've done here, most of those *elses* [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-06-02/server/projects.js#L71-L75) returning `404` errors have not been checked.  

That is why we need a tool to check our code *coverage*. We need to make sure that our tests have gone through each end every line of code so that we are sure they all behave correctly.

[Istanbul](https://github.com/gotwarlost/istanbul#istanbul---a-js-code-coverage-tool-written-in-js) is such a tool. Coupled with Mocha, it makes sure there is not line of code that has not been checked at least once.

Istanbul produces an excellent report.  In order not to waste space in GitHub uploading coverage report for our code, we can have a look at [Istanbul's own coverage report](http://gotwarlost.github.io/istanbul/public/coverage/lcov-report/index.html).  The filenames on the left are links which expand to more and more detail.  Lets take a look at the ones that have the worst coverage, those will show the abundance of information Istanbul can provide.

Beyond the statistics, the uncovered parts of the code are shown highlighted in color [for each file](http://gotwarlost.github.io/istanbul/public/coverage/lcov-report/istanbul/lib/reporter.js.html) individually.  When placing the cursor over each highlighted segment, Istanbul will show a brief description of the error.

The column to the right of the line numbers show the number of times each line has been executed.  This can also help us determine which lines are executed the most and thus can most affect our application performance.   

Coverage is such a standard operation that the `.gitignore` file that GitHub automatically generated for us already lists [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-06-02/.gitignore#L13-L14) the standard folder for our coverage report.

### Installing Istanbul

To set up Istanbul we first need to load it.  Just as ESLint, we may load it globally with `npm i -g istanbul` as recommended in its [home page](https://github.com/gotwarlost/istanbul#getting-started) so we share the same copy for all our applications.  However, we can also load it locally.

```
npm i --save-dev istanbul@1.0.0-alpha.2
```

The part after the package name `@1.0.0-alpha.2` tells NPM to load that particular version of the package.  The default (without the @ part) is to load the latest stale published version. The problem in this case is that the current stable version of Istanbul does not handle some features we will use later on in this book so we have to go for a pre-release version.  Perhaps by the time you read this book, the `1.0.0` is the stable release and specifying the version is no longer needed

Anyway, this helps to explain why we are installing it locally instead of globally.  If we were to install a single global version of Istanbul, which one should we install?  The stable or the experimental?  It would be risky to install an experimental version globally, but then, what do we do with this particular application?  That is why it is better to install the tools locally for each application. Each app gets the version it needs.

Besides, local installs get recorded into `package.json` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-07-01/package.json#L43) which makes it easier to set up the development environment by simply doing `npm install` on a fresh download of the application.  Global installs don't get recorded so we have to tell each new developer about all the globals we expect, and those developers might not be happy about us forcing them to provide our preferences.

### Running Istanbul

To execute it, we need to add another command [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-07-01/package.json#L10) to the `scripts` section of our `package.json`:

```json
"scripts": {
  "start": "node server/index.js",
  "lint": "eslint . || exit 0",
  "test": "mocha",
  "coverage": "istanbul cover node_modules/.bin/_mocha"
}
```

That is it.  Now, we can simply run it.

```
npm run coverage
```

A `coverage` folder will be created in our project.  Look for `/coverage/lcov-report/index.html`. Doble-clicking on it will show the report for our application.  We haven't done that bad, the report shows mostly green indicating we have a reasonably good coverage.  Still, what is missing?

### Improving coverage

If we look at the coverage for `projects.js` we can see that we mostly missed the 404 error returns for non-existing projects or tasks.  We checked that for the GET method, but we haven't checked for wrong `pid`s or `tid`s for the other methods.

Once we get those covered, basically by copying and pasting the error-inducing code for the GET method [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-06-02/test/server.js#L116-L153) and changing the method on each copy [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-07-01/test/server.js#L154-L243), we go from this:

```
=============================== Coverage summary ===============================
Statements   : 86.42% ( 70/81 )
Branches     : 61.76% ( 21/34 )
Functions    : 100% ( 0/0 )
Lines        : 86.25% ( 69/80 )
================================================================================
```

To this level of coverage:

```
=============================== Coverage summary ===============================
Statements   : 95.06% ( 77/81 )
Branches     : 82.35% ( 28/34 )
Functions    : 100% ( 0/0 )
Lines        : 95% ( 76/80 )
================================================================================
```

Since our source code is relatively small, any extra line of code we get covered really makes a whole lot of difference.  

Another remaining uncovered branch is the default for non-existing bodies, which is repeated in several places [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-06-02/server/projects.js#L57):

```js
 Object.assign(prj, req.body || {});
```

If `req.body` is `null` or `undefined`, we provide an empty object.  We haven't done any tests for PUT and POST with no data.  So, we add those tests and, surprisingly, our coverage results don't improve.  The `|| {}` alternative is never used.  What is going on?  As it turns out, the `body-parser` middleware kindly provides an empty object when none is received, thus our default is completely unnecessary. It is not that we missed a test for that condition, it is a condition that can't ever happen. When we drop those [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-07-01/server/projects.js#L57), our coverage of the branches taken improve further as we got rid of a bunch of useless code.

```
=============================== Coverage summary ===============================
Statements   : 95.06% ( 77/81 )
Branches     : 92.31% ( 24/26 )
Functions    : 100% ( 0/0 )
Lines        : 95% ( 76/80 )
================================================================================
```
### Linting

If we now run our linter, we will get thousands of errors, all of them from the folder used for the output of Istanbul. The `.gitignore` file that GitHub produced for us already knows about Istanbul and similar tools [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-07-01/.gitignore#L14) so GIT won't bother uploading those files.  We need to do something similar for ESLint.  By providing a `.eslintignore` file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-07-01/.eslintignore) listing the file and folder patterns of files we don't want checked, we can tell ESLint to ignore those files.

## Summary

Hopefully, these few examples have shown how code coverage can help us improve the quality of our code.  Istanbul is very easy to set up once we have our tests in place and it provides us with plenty of information.  It allows us to be confident that we have every alternative covered as well as strip unnecessary code that will never be executed.
