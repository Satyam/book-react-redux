const axios = require('axios');
module.exports = function (contentEl) {
  axios.get(`/data/v1/projects/${window.location.search.substr(1)}`)
    .then((response) => {
      const prj = response.data;
      contentEl.innerHTML =
        `<h1>${prj.name}</h1><p>${prj.descr}</p><ul>${
          Object.keys(prj.tasks).map((tid) => {
            const task = prj.tasks[tid];
            return `<li><input type="checkbox" ${
              task.completed ? 'checked' : ''
            } /> &nbsp; ${task.descr}</li>`;
          }).join('\n')
        }</ul>`;
      document.title = `Project ${prj.pid}: ${prj.name}`;
    });
};
