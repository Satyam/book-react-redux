# Introduction

With the rapid pace of progress in the creation of libraries and tools for web development, most information comes in brief articles and blog posts.  There are not very many comprehensive guides to all that may be needed from A to Z.

This book intends to fill that gap. We will go step by step gathering the tools and utilities we need for each step and explaining how to use them and coding a full, modern single page application.

We will avoid dumping a whole suite of tools and sample code all at once. There are many full-stack solutions available, however, they are often quite hard to assimilate all at once. They contain too many pieces all strung together without much explanation.  We prefer to go one step at a time.  You may jump ahead and go to the end but then you wouldn't know why we did things the way we did and wouldn't know how to fix it if you disagree.

We won't cover all the alternatives -that would be impossible- but we will present a very good one. We will use Facebook's [React](https://facebook.github.io/react/index.html) coupled with [Redux](http://redux.js.org/index.html) for data handling.

We will write both server and client code and keep track of its development via [GitHub](https://github.com/).  We will lint, test, check its performance and package it for faster delivery and automate all these processes.  We will turn our app isomorphic, that is, able to render fully formed pages straight from the server for faster rendering on slow devices or for SEO purposes.  We will also internationalize it.

A brief itinerary of what we will go through follows, however, you may skip straight into chapter 1.

## Base software

There is some software we need to make sure we have installed.  You might already have it or not.  We'll check that in the first chapter.  To begin with we will need NodeJS, which gives us the ability to leverage our knowledge of JavaScript at both ends.  It is fair to say that JavaScript is not the only alternative on the server side, you might have already used or heard about PHP or Java but unless you have any legacy system and/or experience, nowadays JavaScript is the way to go, one single language across all the application.

Then, we need to create a repository on [GitHub](http://github.com). A repository is the place up in the cloud where all the development team can store and share their work.  GitHub is one major provider of such shared space. Even if we work alone, GitHub will help us to keep track of the progress of the project, report and respond to issues and keep a nice set of safe copies of our job up there in the cloud. It not only works with code, documentation can be stored there as well; after all both this book and the accompanying code are up there in GitHub.

To use GitHub we need to install a GIT client.

## Server side code

In the next few chapters we will work on the server-side. Our browser will show whatever information the server is able to provide so it makes sense to start on that side. Most of what we learn on the server side we will later use on the client side.

Moreover, the server is also a simpler environment.   When we are on the client side we need to take into account too many other issues. This can make it all very confusing.  In the simpler environment of the server, we can go a step at a time.

We will learn to install and create a web server using Express and how to serve data from it by using REST (Representational state transfer) architecture.

To avoid unintended errors, we will do a static check of our code using a *linter*, a sort of compiler that checks the syntax and formatting of our code and only produces a listing of errors, if any.  This will also help us keep a consistent style on the code we produce.  When developing in teams, it is better to have a consistent coding style everyone can easily recognize.

Before releasing this server-side software to the world, it is better to test it dynamically, not just do a static syntax check, which we will do by setting an automated testing system.  This not only ensures that our code works as we meant it to, but also that during development, any changes we make do not break any functionality that was already there.

Once we are sure our code is good, we send the new version back to the GitHub repository.  In this way we share it with the rest of the team so that it can all rejoice and celebrate or, at least, get on with the rest of the project.

Up to this point, in our examples, we would have been storing our data in-memory within the web server.  This would have allowed us to concentrate on the topics described above, however, for any meaningful amount of data, memory storage is not a good idea. There are very many ways to store data server-side.  The first big decision to make is whether to go for an SQL server or a non-SQL or *NoSQL* one. Then, within each of those, which particular implementation.  

For the purpose of this book, we will use a simple SQL database, [SQLite](https://www.sqlite.org/). The SQL language is quite standard, in fact, it is both an ANSI (American) and ISO (international) standard. Admittedly, there are small inconsistencies in between actual implementations, but at least there is a solid base, which NoSQL databases lack.  Within all the SQL databases available, we will use SQLite because it is the simplest one to set up and install.  It is not apt for a serious web service, but for teaching purposes, it works fine.

Once we do the conversion to SQL, we will run the tests again, to make sure we didn't break anything in the migration.  Here, we can clearly see the benefit of having a set of tests made.  We have completely changed our back end software and we can still assure that our server still works as it did before.

As always, after testing, we save it in our GitHub repository.

## Client side

First of all we will learn how to retrieve the data from the server we have been building in the previous chapters.  Our first renderings will be rather crude, but we'll fix that in a moment.

For the browser, we have opted to use Facebook's [React](http://facebook.github.io/react/) as the rendering library.  This is just one of very many options out there and plenty of books could be devoted to praising one or the other.  Many articles certainly have.  It would be easy to say that it handles the V in the MVC model, but that would get us into equally endless discussions about MVC and the many abbreviations derived from it and which of them applies.

A web developer should be able to reach all users using any sort of browser.  It is not admissible to have an application that only works in the most recent release of a particular browser.  The great majority of browsers do not support the latest version of JavaScript, formally EcmaScript 2015, often shortened to ES6.  To deal with that, and the various incompatibilities amongst browsers we will use [Babel](http://babeljs.io/), what is now know as a *transpiler*, that is, a compiler that reads ES6 code and translates it to ES5 code that can run in any browser.

Browsers don't know about *modules* and *packages* as NodeJS does. ES6-style modules are not supported in most browsers, if any. To be able to use modules in the client side, we will use a packager called [WebPack](http://webpack.github.io/) which will produce a single bundle that any browser can easily load and simulate NodeJS-style modules for us.

We will use [React-Router](https://github.com/rackt/react-router) to be able to convert our separate pages into a Single-Page Application (SPA) by allowing the user to navigate across all of our application without resorting to the server.

We will then see how we can consolidate all our data into various models (the M in MVC), separate from the rendering components (the V in MVC) so we can avoid duplication of data and ensure proper synchronization of information across all of our application.

Now that we have the data properly managed, we can start changing it by responding to user interaction. We will do that by using [Redux](http://redux.js.org/index.html) one of the various implementations of the [Flux](https://facebook.github.io/flux/) uni-directional data-flow architecture.   Flux, as originally defined, is a good concept but its implementation as a library is somewhat lacking. Redux, is very well documented and while it is an amazingly small piece of code, it is quite complete and has a good number of tools that supplement it when needed.

As we progress in our application we will see how to improve its looks by using an external style library.  We will use the popular [Bootstrap](http://getbootstrap.com/) though there are many alternatives. We will just use its built-in styles and avoid using its active components so as to show how to code working components.  In practice, once you settled on a user interface style library, you would use its components.

One of the advantages or having JavaScript on the server is that we may run the very same code that runs in the browser. One reason to do that is to improve the user perception of speed.  On slow devices on slow connections, which usually means smart phones, a complex page might take quite a while to load and render.  If a static image of that same page can be produced on the server, it can be immediately displayed to the user even before the application has been loaded.  The other reason is that search engines won't execute your application to find out what it produces in order to index it. A page composed on the fly at the browser is invisible to search engines. Producing a static version of it at the server is the way to have it indexed.  This is called isomorphism, the ability to look the same at either end. We will see what needs to be done to turn our application into an isomorphic one.

Finally we will deal with internationalization, the ability of an application to show up in different languages and using regional conventions to display numbers or dates.

All along we will make an aside on writing the code to check it by linting and testing it.

It is unfortunate that we will not be able to show any utility to provide automated documentation.  The existing utilities lag behind the tools we will be using, the docs they provide fall quite short of really describing the code.  The best ones analyze the code itself to fill in part of the documentation.  While this is a good idea to reduce the work of the programmer, many of these are unable to understand ES6 or JSX (more on JSX later) so they get totally confused.  The results are quite unsatisfactory so we will not cover them.  We will just hold on to the basic principle of writing small modules in separate files with sensible names placed in a logical folder structure and providing self-describing identifiers to any named thing.
