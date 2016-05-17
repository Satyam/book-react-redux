import React from 'react';
import { Link } from 'react-router';
const data = require('./data.js');

const PrjItem = ({ pid, name }) => (
  <li>
    <Link to={`project/${pid}`}>
      {name}
    </Link>
  </li>
);

PrjItem.propTypes = {
  pid: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
};

const ProjectList = () => (
  <div className="index">
    <h1>Projects:</h1>
    <ul>{
      Object.keys(data).map(pid =>
        (<PrjItem key={pid} pid={pid} name={data[pid].name} />)
      )
    }</ul>
  </div>
);

export default ProjectList;
