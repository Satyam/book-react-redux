import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export const ProjectItem = ({ pid, name, active, pending }) => (
  <li className={active ? 'selected' : ''}>
    {
      active
      ? name
      : (
        <Link to={`/projects/${pid}`}>
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

export const mapStateToProps = (state, props) => state.projects[props.pid];

export default connect(
  mapStateToProps
)(ProjectItem);
