<div class="notice">This is the new, still unfinished version of the book. The previous version, also unfinished but far more complete is also available <a href="old.html">here</a>.  See the <a href="https://github.com/Satyam/book-react-redux/blob/master/README.md">README</a> file in the GitHub repository for further information.</div>
# Introduction

The purpose of this book is to show how to create an isomorphic single-page-application (SPA) using React and Redux. It contains both client and server-side code to show how the client can interact with the server by using the [REST API](https://en.wikipedia.org/wiki/Representational_state_transfer).

## The Application

It is isomorphic, meaning that on the initial load, the server can generate and provide the client with a static image of the request page with the corresponding data, which notably reduces the time a slow device, such as a tablet or smart phone, would normally require to produce the initial page.

It can also run on a desktop using [Electron](http://electron.atom.io/) though no attempt has been done to exploit the desktop environment, for example, by moving the main menu from the page itself to the desktop application menu.

It is quite small, just what is required to show the main techniques described. It is, however, extensible and many other features could easily be added.  Likewise, testing is scarce, just enough to show how to test the different elements in it. Though the code does work (and please let us know if it does not) the code is meant as a working sample to support this book, not to solve any real-life problem.

Unlike the many application boilerplates available [(see)](https://github.com/facebook/react/wiki/Complementary-Tools#full-stack-starter-kits) the intention is to fully explain what the code does so instead of a recipe to follow, this book is meant as a guide on how to build an app.

## Resources

The book and the code are available in [GitHub](https://github.com/Satyam/book-react-redux).

Any issues with this book or the code can be reported via the projects' [issues](https://github.com/Satyam/book-react-redux/issues) section.
