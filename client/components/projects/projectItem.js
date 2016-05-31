import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export const ProjectItem = ({ pid, name, pending }) => (
  <li className="project-item">
    <Link
      to={`/projects/${pid}`}
      activeClassName="disguise-link"
    >
      {name}
    </Link> [Pending: {pending}]
  </li>
);

ProjectItem.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  pending: PropTypes.number.isRequired,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => state.projects[props.pid];

export default connect(
  mapStateToProps
)(ProjectItem);
