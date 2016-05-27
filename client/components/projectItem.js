import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export const ProjectItem = ({ pid, name, active, pending }) => (
  <li className={active ? 'selected' : ''}>
    {
      active
      ? name
      : (
        <Link to={`/project/${pid}`}>
          {name}
        </Link>
      )
    } [Pending: {pending}]
  </li>
);

ProjectItem.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  pending: PropTypes.number.isRequired,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => {
  const pid = props.pid;
  const project = state.projects[pid];
  return {
    pid,
    name: project.name,
    pending: project.pending,
  };
};

export default connect(
  mapStateToProps
)(ProjectItem);
