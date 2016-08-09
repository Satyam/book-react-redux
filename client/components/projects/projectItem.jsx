import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link, routerShape, withRouter } from 'react-router';
import styles from './projectItem.css';

export const ProjectItemComponent = ({ pid, name, pending, router }) => (
  <li className="project-item">
    <Link
      to={`/projects/${pid}`}
      activeClassName={styles.disguiseLink}
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

ProjectItemComponent.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  pending: PropTypes.number.isRequired,
  router: routerShape,
};

export const mapStateToProps = (state, props) => state.projects[props.pid];

export default withRouter(connect(
  mapStateToProps
)(ProjectItemComponent));
