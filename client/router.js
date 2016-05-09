const index = require('./index.js');
const project = require('./project.js');
const contentEl = document.getElementById('contents');
if (/^\/(index\.html)?$/i.test(location.pathname)) {
  index(contentEl);
} else if (/^\/project\.html$/i.test(location.pathname)) {
  project(contentEl);
} else {
  contentEl.innerHTML =
    `Page ${location.pathname} is not available`;
}
