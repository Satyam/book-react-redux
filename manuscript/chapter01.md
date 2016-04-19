# Initial software setup

## NodeJS

For a long time, Web developers had to learn one of several languages to code on the server, usually PHP, Python, Java or whatever your company had available.  Shyly, some developers started adding some interactivity to web pages using JavaScript.  JavaScript started to grow with sophisticated web applications such as Google Maps or fancy email clients. Thus, developers ended up having to use two different languages, one for the client, JavaScript, and another for the server.

All that changed in 2009 when Ryan Dahl adapted Google's open source V8 JavaScript engine to work in Linux. With later versions made to work in all popular platforms, NodeJS allowed web developers to use one single language everywhere: JavaScript.

We need to check if we have NodeJS already installed. At a command prompt we can type `node --version` or `node --help` which will either fail if NodeJS is not installed or produce a suitable response.  At the time of reviewing this chapter, the version for NodeJS is 4.4.2.  If you do have an older NodeJS it means you already know how to install it and hopefully how to upgrade it.

To install NodeJS simply go to the download page on their [site](https://nodejs.org/). The home page will detect which download is suitable for your computer and offer it as a download.  NodeJS offers two versions, the `LTS` (Long Term Support) which is the safest one, which is what we will be using, and a more adventurous one for developers willing to experiment with the upcoming features.

## NPM

NodeJS became quite a success and suddenly lots of developers were writing software to run on it.  NodeJS promotes a very modular way of writing code.  Instead of big source files containing hundreds of lines of code, it is much better to split the code in small, very maintainable pieces called *modules*. Several of those *modules* can be grouped together to make a *package*.  To help in managing those packages, Isaac Z. Schlueter wrote `npm`, NodeJS Package Manager. Initially, `npm` had to be installed separately, currently it is installed along NodeJS so there is nothing you have to do, if you installed NodeJS, you have `npm`.

NPM is not just software, there is also a web site [npmjs.com](https://www.npmjs.com/) that contains above two hundred thousand free packages. Npm, Inc, the company that runs the site, does not evaluate the quality of those packages but it provides good information to evaluate its worth. There are very many well known excellent packages. We will use several of those.

## Editor

Comprehensive IDEs such as Eclipse or Microsoft's Visual Studio have fallen out of favor mostly because they are too heavy and slow. As Web development changes fast, it is impossible for the large IDEs to keep pace. The current trend is towards smaller and fast text-editors with a flexible plugin architecture so, whatever the original designers left out, someone else can add.

If you don't have a beloved text editor installed in your system I'd like to suggest a couple of interesting options Adobe [Brackets](http://brackets.io/) and GitHub [Atom](https://atom.io/).  Both are very capable and fast editors and both have a large list of plugins to add any features not already built-in.  The most interesting feature of both is that they are written mostly in JavaScript running in NodeJS, which you should have installed by now.

Both editors are also open source and anyone of us can contribute to its development or add plugins.  As any such large collaborative project, they are both hosted in GitHub ([:octocat: Brackets](https://github.com/adobe/brackets) and [:octocat: Atom](https://github.com/atom/atom))  

## GitHub

Teams of developers, possibly continents apart, need somewhere to put their source code which they can all reach. GitHub has become the place of choice for that. The last two links in the previous section point to software stored in GitHub. The little icon before each name is Octocat, GitHub's mascot. Lots of people got creative with this little creature and there is the Octocat Index or [Octodex](https://octodex.github.com/) showing many of its personalities. We will use that icon along links pointing to code residing in GitHub.

It is now time to setup your GitHub account.  Go to [GitHub](https://github.com/) and create your account. Just follow the instructions on the screen.  To finish the account creation process, GitHub will send an e-Mail message to validate the address you have provided. GitHub will recognize you by your e-Mail address so it is vital that it works but it will not make it public unless you tell it to.

All your postings in GitHub will show the user name you have given when you created the account.  Do provide a good user name because that is how everyone will refer to you and, hopefully, make you famous.  Your Twitter handle or similar known alias would be a good choice. GitHub will use your name for a folder where all your stuff will be stored.  Unfortunately, many good, short names are already taken, some of which you don't even see because they might be private projects.

Software in GitHub is stored in *repositories*.  Repositories can be public or private.  Public repositories are free. Absolutely everyone can see what you store in them but only those you set as collaborators can modify it.  If you want to keep your code secret, then you have to create a private repository and pay a fee.  

Though we will use GitHub to store computer code, it can actually be used for any kind of text, such as this book [(:octocat:)](https://github.com/Satyam/book-react-redux) or all sorts of documents like those issued by government agencies [(:octocat:)](https://github.com/GSA). Many legal firms, editors and publishers, translators and others sharing large amounts of documents also use it though, understandably, they tend to use private repositories.

Though everyone can see and download anything in public repositories, to actually change anything, besides having permission to do so, you can either use the on-line editor, which is only practical for minor modifications, or use a git client which lets you synchronize your local working copy and the one in the remote repository.

## GIT

Git is a source control system. It allows a distributed team of people to share and keep track of changes in source code over time. It was initially designed in 2005 by Linus Torvalds to manage the Linux kernel, the version of Unix he wrote and named after himself.  Linux which, at the time, was the largest open source project in the world, needed a safe, secure and fast means of allowing its collaborators to work together.  None of the existing systems satisfied all the expectations of the team so they developed one of their own.

The basic Git client software can be downloaded from their [download page](http://git-scm.com/downloads).  The basic Git client software is a command-line utility with no user interface.  Several [GUI clients](http://git-scm.com/downloads/guis) are listed in the same site. In this book, however, we will use the command-line commands, since they are the standard. For Windows or Mac users I would suggest [GitHub's own desktop](https://desktop.github.com/) since that is where we will store our code. Many popular coding text editors and IDEs (Integrated development environment) have plugins for Git.

Once Git is installed, we need to set it up.  Since Git will interact with remote servers, you need to provide it with information about you.

`git config --global user.name "YOUR USER NAME"`

`git config --global user.email "YOUR EMAIL ADDRESS"`

It is best to use the same user name and e-mail address you used on your GitHub account. GitHub will use the e-Mail address to associate your commits with your GitHub account. GitHub will not make your e-Mail public unless you explicitly tell it to. Do not change the e-Mail address once you set it up, otherwise, GitHub will no longer recognize you.  The user name you give to your git client may or may not match your GitHub account name, but then, why wouldn't it?

In order to prevent GitHub from requesting your login information too often, you might want to tell git to temporary remember you.  

`git config --global credential.helper cache`

Git will remember you for about 15 minutes after a login, if you want to change that, you can do:

`git config --global credential.helper 'cache --timeout=3600'`

Timeout is measured in seconds so the above gives you one hour.

If you have a Git GUI or a plugin for your editor, they will usually offer to save your credentials for you.

## Working with repositories

### Creating a repository

Go to [GitHub](https://github.com) and, if you are a new user, you will see a mostly empty page except for some pictures linking to some tutorials.  Somewhere on that page (the design might vary over time) there will be a button to create a <kbd>New repository</kbd>. Click on it (nothing will happen until you confirm it) and fill in the name and description.  Select a public (free) repository, opt to have a README file and select a `.gitignore` for `Node` and a license.

As Nicholas C. Zakas explains in a recent [article](https://www.nczonline.net/blog/2015/12/why-im-not-using-your-open-source-project/) selecting a license is vital.  You might assume that by not imposing a license requirement you are leaving your code open for anybody to use.  Quite the opposite, in most countries unless you explicitly surrender your rights, the copyright is yours.  You can either pick one of the very many licenses on offer (I suggest the MIT License) or state your own terms. Don't try to be funny with the terms of your license if you make your own.  A well known piece of software added the clause "The Software shall be used for Good, not Evil" and caused quite a [lot of trouble](https://en.wikipedia.org/wiki/JSLint#License).

Finally, click on the <kbd>Create repository</kbd> button.  You can actually add both the `README`, `.gitignore` and license files later on and if you are not happy with the name or description, you can change it as well.  And if you don't like anything in it, you can delete it though, once you start working on your project, it would be a shame.

### Cloning your repository

So far you have the basic structure of a project but it is only up there in GitHub, you have nothing in your own computer.  The first thing we need to do is to make a local working copy of it and to do that we will *clone* it.

Somewhere in the page (now it is above the file listing but it used to be on the right so, just look for it) there is a dropdown that lets you pick either <kbd>SSH</kbd> or <kbd>HTTPS</kbd> and to its right there will be a long string that looks like an URL, for example, if you select <kbd>HTTPS</kbd> you might see `https://github.com/MyUserName/MyNewRepository.git`.  Copy that string.

In a terminal, command prompt or whatever you call it in your operating system type `git clone ` and then paste the URL you copied from GitHub. The `git clone` command  will create a folder with the repository name under your current folder and  download everything in the repository.  It will also add a `.git` folder with some configuration information related to the repository.

If you now do a `cd MyNewRepository` (or whatever you called it) you will see your `README.md`, `LICENSE` and `.gitignore` files.  Unix-based systems, by default will not show files starting with a dot so you might not see the `.gitignore` file.  We will see the purpose of this file later on.

The `LICENSE` file is a plain text file containing the terms of the license you have selected.  

The `README.md` file is what contains the text that is shown right below the file listing in the GitHub repository.  It is a plain text file written in [Markdown](https://guides.github.com/features/mastering-markdown/) format, the same used in writing this book.  The sample file will contain the name of the repository as its main heading and the description provided when you created the repository as its content.

You might want to change some of the text in that README.md file to try out some of the styles shown in the [guide](https://help.github.com/articles/markdown-basics/). Markdown was [originally designed](https://daringfireball.net/projects/markdown/) to be an easier way to generate simple HTML, improving on the usual `readme.txt` files that used to be distributed along software packages.

If you are using the [Brackets](http://brackets.io/) editor you might want to install the [MarkdownPreview](https://github.com/gruehle/MarkdownPreview) extension.  If you are using [Atom](https://atom.io/) you already have the [markdown-preview](https://atom.io/packages/markdown-preview) plugin installed. Either will let you see a preview of how your README.md will look once uploaded to GitHub.   GitHub uses a particular [flavor](https://help.github.com/articles/github-flavored-markdown/) of Markdown so except for the Atom previewer the results shown on others might be slightly different.

### Uploading the changes

We want to change something in our working copy so we can see how to upload our changes to GitHub. We have already played a little bit with our README.md.  Now, lets go and create a folder called `server` where we will put the code we are about to write. Lets put a file there, an empty file called `index.js`.  We will fill it up later, but for now, lets just see how git works.

Go to the terminal or command prompt and type `git status`.  This will show which files have been modified such as the README.md, and which files are *untracked* which means they have been newly created and git has no clue about them yet.  This already tells us something, git keeps track of the files it knows about, namely, those that have been brought from your GitHub repository.

Uploading files to your remote repository is a process similar to sending a package through the mail.  First you put everything into a box. In git parlance this is called *staging*. Git already knows about those files you have received, however, it doesn't know about the new files you have added or which files you want to include in the box. For whatever reason, you might want to ship your files in separate packages but, if you know that everything in your working folder should go, you can simply do a `git add .` .  Note the dot after `add`, meaning the current working folder.  This will add to the box every file and folder it finds in the current folder and in those below.  

If you repeat the `git status` command, you will see the files previously listed in red (if your terminal/command prompt supports such coloring) now showing in green meaning that they are in the box, that is, *staged*. `git status` is always a handy command to use. Another useful one is `git diff README.md` which will show a list of the differences in between your working version of the README.md file (or any other you ask for) and the copy in the repository.

Now that you have everything in the box, you have to close it and label it.  You do that with `git commit -m "my first commmit"`.  The `-m "whatever"` is optional and if you don't provide that option, git will fire up whichever your default text editor might be configured in your system (notepad, gedit, etc.) and let you write a brief description of what you have changed in this commit.

Finally, you just have to dispatch it.  You do this by pushing it: `git push origin master`. You will then be asked for your user name and password.  So far there had been no need for identifying yourself. Since the repository is public, everyone can read it and clone it.  All the changes you then do in your local workspace are of no concern to git, however, when you `push` your changes back GitHub needs to make sure you are authorized to do that.

The basic command is `git push` but you need to add some destination address to your shipment.  We won't deal with that right now but suffice it to say that git is able to manage multiple versions or *branches* of the same project and also deal with hierarchies of repositories so that, for example, in our case a sub-team might deal with server-side development and another with client-side development and each have a sub-repository from the main repository. That is the reason for those extra options.  Since, for the time being, we are the only users of our single repository, we will always do `git push origin master`.

If we go to [GitHub](https://github.com) we will now see our changes reflected in the repository.  If we did any changes in the README.md file, the home page of the project, shown right below the file listing, will display the new text.  We can also dig down into the `server` folder where we will find the `index.js`.  The description we provided when we issued the `git commit` command with the `-m` option will be shown along the files affected as well as the date of the change.

If we open the README.md file, we will see its raw, unformatted contents and at the top we can see there is a button labeled `History`.  This will show us each of the changes done on the file (not many right now) each accompanied with its commit description and time stamp and, if we click on any of the entries, we will see the file with its changes marked green for the additions and red for the deletions. Two columns of line numbers on the left correspond to the before and after source files.

There is not much to see right now but try it out later on once we have done some few changes. There is far more to git and GitHub than what we have mentioned so far.  It really shines when used with large teams in big projects but, for the time being, it is good to becomes somewhat familiar with it.

## Summary

We have learned how to install several of the tools we will need to develop our application: NodeJS, NPM and optionally some JavaScript editors written in JavaScript.

We have also installed GIT which allows us to work with GitHub, a place where we can store our code, keep track of the changes, share it with others, track bugs and issues and, in general, manage much of the process of creating an application.

Finally, we created a *repository* within GitHub to test these tools.
