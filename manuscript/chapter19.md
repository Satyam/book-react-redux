# Styling

Our application is not looking good. As a working example on the technologies behind the screen, it shouldn't matter much, but it is really starting to strain the eyes.

There are many well-known UI libraries and some of them have their active components ported to React, such as Twitter's [Bootstrap](http://react-bootstrap.github.io/), Google's [Material Design](http://www.material-ui.com/#/) or Thinkmill's [Elemental](http://elemental-ui.com/).  Using their active React components is quite easy, we would simply have to follow the recipes give in their documentation. There is no general rule as to how active UI components should work, be configured or respond so, we cannot cover it in this book.

We will only use some of their styles and icons. Besides the fancy coloring and shading, the most useful thing we will use is the grid system.  This allows us to distribute our components more efficiently across the page.  In the early days, we would use `<table>` elements to help us distribute UI elements.  With the ample variety of screen sizes we have to plan for nowadays, tables don't work any longer.  CSS grids, on the other hand, allow for more fluid layouts that can fit both the widest screen of a desktop and a narrow one in a smart phone.

Iconography has also transitioned from small image files in `.png` or `.gif` format to fully scalable fonts that represent images instead of characters.  There are plenty to select from here as well, [Material Icons](https://design.google.com/icons/), [Bootstrap Glyphicons](http://getbootstrap.com/components/#glyphicons) or the excellent [Font Awesome](http://fontawesome.io/icons/).  Icons are very useful in reducing the clutter of text in our pages by providing easily recognizable elements to interact with, saving on explanatory captions for buttons and such.

We will use the very popular Bootstrap just because it is, indeed, very popular. To have it available to our application, we have to include a couple of CSS files in our single HTML file:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-01/public/index.html#L6-L7)

We have opted to download a copy of the distribution files and extract the `/css` and `/fonts` folders into our `/public` folder.  Neither of those folders show up in GitHub because it would be abusive to upload them there so we have excluded them in our `.gitignore` file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-01/.gitignore#L29-L31) thus, from now on, when downloading and running any of the samples for this book, if things look messy, it might be because those two folders are missing.  It is important that the `/fonts` folder be side-by-side with the `/css` folder since the CSS files contain relative references to the fonts.  Otherwise, Bootstrap can be loaded from several CDNs as their own site [explains](http://getbootstrap.com/getting-started/#download-cdn).

We have improved on our HTTP errors box in the `App` component:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-01/client/components/app.js#L8-L16)

Instead of our own `errors` className, we have switched to using some of Bootstrap's built-in styles.  We have also added a `close` button to the box by following one of their simple [recipes](http://getbootstrap.com/css/#helper-classes-close).  We have moved the `onClick` handler from the whole error box to just this button.

Instead of having a simple `Projects` link at the top of the screen, we have moved to a tabbed interface:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-01/client/components/app.js#L17-L23)

By using the `nav nav-tabs` classNames on an enclosing `<ul>` element, and turing each entry into a `<li>` we have now a tab that can grow across the top of the page.

Since we no longer use the `errors` className, we have deleted it from the `index.css` file [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-01/public/index.css).   If we hadn't done so, nothing would have happened.  If the styles in it aren't used, they are just wasting space.  This is often a problem, stylesheets getting out of sync with the code that supposedly uses them.  CSS files often grow endlessly because nobody feels comfortable deleting a style that might be in use who-knows-where. It often is less risky to leave the style behind than risk breaking a layout because deleting too much.

We have been careful to fully qualify the styles with a whole hierarchy of classNames, like `.app .project .task-list .completed` so that it clearly states the component it belongs to.  The `.completed` className would have worked just as well without so much qualifying, but it would be very easy to lose control.  The best, however, is to keep each component with its own stylesheet. WebPack can help.

## Including CSS files.

We know that WebPack allows us to pre-process a file before it gets included in the final bundle.  We've been doing that all along since we've told WebPack to use Babel to process the files as they are loaded [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/master/webpack.config.js#L12-L18). We can do something very much alike with CSS files.

To tell WebPack to handle CSS files we need to add an entry to the list of loaders:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-02/webpack.config.js#L18-L21)

Just as we told it to use Babel for those files ending with `.js` or `.jsx`, we are now telling it to use `style!css` for those ending with `.css`.  Actually, that setting represents two separate but chained loaders, [style-loader](https://www.npmjs.com/package/style-loader) and [css-loader](https://www.npmjs.com/package/css-loader) which, as usual, we have to install first:

```bash
npm i -D css-loader style-loader
```

WebPack assumes the `-loader` ending so that `babel` actually looks for `babel-loader` and uses the `!` sigh to chain loaders together.  If, instead of using plain CSS we used some pre-processor such as [Less](http://lesscss.org/) or [Sass](http://sass-lang.com/) we might have added an entry like these:

```js
{ test: /\.less$/, loader: 'style!css!less' },
{ test: /\.scss$/, loaders: ["style", "css", "sass"] }
```

Loaders can be listed in a string, separated by `!` using the `loader` property name or listed in an array with `loaders` (notice the plural).  

Now we can take the global style definitions out from `index.css` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-01/public/index.css) and place the along their respective component.  We will do that for `App`.  We create a file `app.css` in the same folder as `app.js` containing the single style definition used there:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-02/client/components/app.css)

To use that style definition, we simply need to import it into `app.js`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-02/client/components/app.js#L4)

That is all that needs to be done.  We use the plainest form of `import` since we don't really need to have access to whatever `app.css` might export.  It is important to explicitly include the `.css`, `.less`, `.scss` or whichever extension your style files are because otherwise WebPack, following NodeJS rules, will default to look for files ending in `.js`.

Once we moved all the component styles to their separate `component.css` files [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/chapter-19-02/client/components/projects), we may delete the now empty `index.css` file and drop the reference in `index.html` [(:octocat:)](https://github.com/Satyam/book-react-redux/tree/chapter-19-02/public).

We have solved the management issue of keeping the styles in sync with the components that use them in order to avoid having an ever-growing global CSS file. Or at least we are on our way to solving it, for example, `taskList.css` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-02/client/components/projects/taskList.css) has a single style that actually should belong to `task.css` which does not exist yet.  The application works and it looks fine, which comes to prove how difficult it is to find these kind of errors. We might have done the very same by several other means, for example, by creating a script to concatenate the files following a particular naming pattern.

We are still forced to keep the convention to assign the enclosing element in each component a className, and use that className to qualify the styles, for example, in `App`, we have:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-02/client/components/app.js#L6-L8)

so that in `app.css` we do:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-02/client/components/app.css#L1)

This discipline of reserving a className for each component so as to qualify its styles is difficult to maintain and hard to enforce is we are to use third party components.   Since the `.app` className goes into the overall frame for the whole application, any children or deeper descendant having an element with the  `.loading` className will get a spillover from `.app .loading`.   This could be solved by applying the `.app` className to anything but the children:

```js
export const App = ({ children, pathname, loading, errors, onCloseErrors }) => (
  <div>
    <div className="app">
      <p className="loading" style={{ display: loading ? 'block' : 'none' }}>loading</p>
      <!--  .... -->
    </div>
    {children}
    <div className="app">
      <!--  .... -->
    </div>
  </div>
);
```

The outside `<div>` has no className and it encloses two further `<div>`s that do have the `.app` className and `{children}` which doesn't.  Another alternative is to enable WebPack support for [CSS Modules](https://github.com/css-modules/css-modules).

## CSS Modules

CSS Modules is a proposed mechanism to be able to do with CSS what we already do with JavaScript via NodeJS `module.export`/`require` or ES6 `export`/`import`, that is, to keep information in separate modules instead of getting everything mixed up in a global context.

To enable CSS modules in WebPack we simply need to add a configuration option to the entry for loading css files:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-03/webpack.config.js#L18-L21)

The `loader` setting in WebPack is written as a series of URL-like style series of loader specs, separated by `!`.  For each of the loaders listed, a series of configuration options can be given as in the query parameters of a URL, with the query string after a `?` and successive setings separated by `&`. Each setting might be `options=value` or `option`, which is equivalent to `option=true`.

In the above case, we are telling the `css-loader` module to use CSS modules and to convert to camel-case.  We will soon see why the latter.

Using CSS modules we don't need to use qualifiers in our CSS files since now the declarations within don't got into the global namespace and they can only be accessed by the modules that explicitly import them. In reality they do go into the only global namespace that the DOM provides, but they are wrapped in such a way as to make it look as if they aren't.

The `app.css` file looks very much the same, but without the leading `.app` qualifier:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-03/client/components/app.css)

To use that style, `app.js` needs to import them into a variable and then use it like this:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-03/client/components/app.js#L4-L8)

The css file is imported into the `styles` variable which will then contain an object.  To use any of the styles in the css file, we access it by name within that object: `{styles.loading}`.

We still keep the `app` className on the enclosing `<div className="app">` mostly as an aid for us when debugging the application and trying to find which component produced which HTML and, perhaps, for some global styling, but otherwise, there is no longer any need for these component classNames.

Any number of styles can be defined in a single CSS file:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-03/client/components/projects/task.css)

And combined, even on the same element:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-03/client/components/projects/task.js#L14)

The `camelCase` option on the `css-loader` is to convert CSS-style identifiers to JS-style ones, like with `disguise-link`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-03/client/components/projects/projectItem.css)

This allows us to use it like this:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-03/client/components/projects/projectItem.js#L9)

The `css-loader` provides us with the `disguiseLink` alias but also gives us the original `disguise-link` though, the original is harder to use:

```js
activeClassName={styles['disguise-link']}
```

Notice how the `css-loader` does not get confused by code like this:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-03/client/components/projects/projectList.js#L8)

It is quite able to distinguish between the global `project-list` className and the local `style['project-list']` (or `style.projectList`) className.

Somehow, the [classnames](https://www.npmjs.com/package/classnames) module we mentioned [earlier](#chapter16-class-names) starts making much more sense.  It even allows us to simplify `app.js`:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-04/client/components/app.js#L9-L17)

Instead of conditionally setting the `display` style to `block` or `none` to show or hide the loading indicator and the errors list, `classnames` makes it easy to apply Bootstrap's [hide](http://getbootstrap.com/css/#helper-classes-show-hide) helper className.

## Composing styles

The styling of the HTTP errors list above is not right.  It uses too many of Bootstrap's ready-made styles right from the `.js` file, instead of the CSS file where it should.  As a matter of fact, the whole `App` component has too many styling features.  Why would it have a `<pre>` tag to enclose the errors list?  Wouldn't it be better to have a plain `<div>` and let the graphic designer how should it look?  That is what we've done in this version:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-05/client/components/app.js#L7-L33)

Now it has only two sets of tags which are not `<div>`s, a `<button>` and a set of `<ul>`-`<li>` tags, both of which are exactly what they are semantically meant to be.  In the end, the button will not look like a regular button and the list is going to look like a set of tabs but as for the component, the it simply describes the content, not how it will look.

In all cases, most elements have their `className` set to styles taken from the `app.css` import.

The `.errors-list` style is particularly interesting:

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-05/client/components/app.css#L11-L17)

The `css-loader` accepts the `composes` pseudo-attribute that allows a style definition to import the settings from another style. They should always precede any other setting and they can be overridden by later settings.  In this case, we are importing the definitions for `alert`, `alert-warning` and `alert-dismissible`, the very same ones we were using so far, taken from Bootstrap.  Since we are loading Bootstrap's CSS files globally, we enclose their names in `global()` so `css-loader` knows where they are.  Then we are making the `<div>` look like our earlier `<pre>`.

[(:memo:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-05/client/components/app.css#L28-L34)

For the `<button>` we are using the same classNames from Bootstrap and we are setting the contents via CSS to the Unicode for the `&times;` HTML entity we had before.  The graphics designer might have as well used an image or icon.

Still, we have Bootstrap loaded globally.  We may avoid this.  The `composes` pseudo-attribute allows us to reference styles in other files, for example, in `bootstrap.css`.  For example, it would have been possible to do:

```css
.closeButton {
  composes: close from "bootstrap.css";
  composes: pull-right from "bootstrap.css";
}
```

This assumes that we have created an alias for `bootstrap.css` in our WebPack configuration file.   If we imported all the styles we compose ours with, we would no longer need to link to them in `index.html` [(:octocat:)](https://github.com/Satyam/book-react-redux/blob/chapter-19-05/public/index.html#L6-L7).  However, the Bootstrap files are large and even if we import a couple of styles from them, WebPack will load the whole file.  Worst still is that it will try to load the font file for the *glyphicons* and fail because WebPack doesn't know how to do that.

We have to specify the loaders WebPack has to use for fonts whether the ones from Bootstrap or Font Awesome:

```js
{ test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url" },
{ test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/, loader: 'file' },
```

And then install them:

```bash
npm i -D file-loader url-loader
```

It is, however, a bad idea to load the whole of Bootstrap in this way. The size of our bundle will increase significantly.  It is better if done with a smaller, customized version, which is quite easy to produce following Bootstrap [instructions](http://getbootstrap.com/customize/#less) or even better to load it globally as we are doing right now.

WebPack can also load and bundle images in various formats provided of the suitable loaders.

## Summary

We have seen how we can improve the looks of our application by using any of many UI libraries available for free.

We learned how we can deliver a full component, JavaScript, markup and style using WebPack to import CSS files as it does with regular modules and how to keep their definitions private to the module importing them, avoiding conflicts with overlapping selectors.

This has freed us to use plenty more CSS styles than before, certain that we don't risk messing up with other components, packing each component with its own private style definitions.

We have also been able to import css styles from either globally loaded CSS files or external sources.
