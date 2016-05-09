const axios = require('axios');
module.exports = function (contentEl) {
  axios.get('/data/v1/projects')
    .then((response) => {
      contentEl.innerHTML =
      `<h1>Projects:</h1><ul>${
        response.data.map((item) =>
          `<li><a href="project.html?${item.pid}">${item.name}</a></li>`
        ).join('\n')
      }</ul>`;
      document.title = 'Projects';
    });
};
