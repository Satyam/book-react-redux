import React, { PropTypes } from 'react';
import { Link, routerShape, withRouter } from 'react-router';
import './projectItem.css';

export const ProjectItem = ({ pid, name, pending, router }) => (
  <li className="project-item">
    <Link
      to={`/projects/${pid}`}
      activeClassName="disguise-link"
      onClick={ev => {
        if (router.isActive(`/projects/${pid}`, true)) {
          ev.preventDefault();
        }
      }}
    >
      {name}
    </Link> [Pending: {pending}]
  </li>
);

ProjectItem.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  pending: PropTypes.number.isRequired,
  router: routerShape,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => state.projects[props.pid];

export default withRouter(connect(
  mapStateToProps
)(ProjectItem));
