import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import styles from './projectList.css';
import classNames from 'classnames';
import ProjectItem from './projectItem';

export const ProjectList = ({ children, projects, newProject }) => (
  <div className={classNames('project-list', styles.projectList)}>
    <h1>Projects:</h1>
    <div className="row">
      <div className="col-md-9">
        <ul>{
          Object.keys(projects).map(pid =>
            (<ProjectItem
              key={pid}
              pid={pid}
            />)
          )
        }</ul>
      </div>
      <div className="col-md-3">
        {newProject
          ? (<button className="btn btn-default" disabled="disabled">Add Project</button>)
          : (<Link className="btn btn-default" to="/projects/newProject">Add Project</Link>)
        }
      </div>
    </div>
    {children}
  </div>
);

ProjectList.propTypes = {
  children: PropTypes.node,
  projects: PropTypes.object,
  newProject: PropTypes.bool,
};

import initialDispatcher from 'utils/initialDispatcher.js';
import { getAllProjects } from 'store/actions';
import isEmpty from 'lodash/isEmpty';

export const initialDispatch = ProjectList.initialDispatch =
  (dispatch, nextProps, currentProps, state) => {
    if (isEmpty(state.projects)) {
      return dispatch(getAllProjects());
    }
    return undefined;
  };
import { connect } from 'react-redux';

export const mapStateToProps = state => ({
  projects: state.projects,
});

export default initialDispatcher(initialDispatch)(connect(
  mapStateToProps
)(ProjectList));
