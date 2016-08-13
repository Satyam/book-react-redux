# Annotated Single Page Application using React and Redux

This repository contains two books, one of them unfinished the other a work in progress.

## The unfinished book

The readme file for the old book is still there in [README.old.md](https://github.com/Satyam/book-react-redux/blob/master/README.old.md) and the book itself is still available [here](http://satyam.github.io/book-react-redux/).

The text goes for 20 chapters (the repository contains a separate branch for each of the chapters and sections within the chapter). The code goes up to chapter 23, but it has no associated text in the book.  It shall remain so. It was thanks to [Iliyan Peychev](https://github.com/ipeychev) that I finally realized I was taking the wrong path.

I attempted to develop the full application in successive chapters, explaining why I made each step, going from the most primitive to the more elaborate.  All along the way, I explored many alternatives just to show why they were dead ends. In the chapters that followed, I would correct that. I meant to make it a novel instead of a manual.  That was not a good idea.  

Besides boring the reader to death, nobody could open it in a random chapter and be sure the solution presented there was the good one. Perhaps it is just a wrong path, the wrong *suspected murderer* in the detective story. In the end, all would be solved and the culprit found. As a matter of fact, the code in the later chapters in this book is good so you might just want to jump there.  However, if you go there and want to understand why something was done in a certain way, you would have to go back to who-knows-where to find out why.

Clearly, this was not good. Thus, I dropped it.

## The new book

What I did instead is to develop a sample app as I think it would be best done and the new book will explain what each part does and why it is done that way.  It will not contain simple in-line comments, instead it will try to explain how each part works within the whole.  In that, I mean to depart from the usual boilerplates.  Instead of presenting a solution for you to adopt wholesale, I mean to explain why I picked one alternative or another so you can make your own decisions.

## What it contains

The application is a Single Page Application (SAP) done using [React](https://facebook.github.io/react/index.html) and [Redux](http://redux.js.org/index.html) and it also contains the server code based on [Express](http://expressjs.com/) which is capable of delivering server-side rendered pages as well, that is, it is an isomorphic web app.

Finally, since I liked the concept of [Electron](http://electron.atom.io/), I decided to give it a try and transform it into a desktop Electron app using, basically, the same code.

All this, however, is in the future.  The code is there, you can check it out in the [master](https://github.com/Satyam/book-react-redux/tree/master) branch but the annotations are a work in progress.

I hope you'll like it.  Cheers.
