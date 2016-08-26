import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import isPlainClick from '_utils/isPlainClick';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import initialDispatcher from '_utils/initialDispatcher';
import { getAllProjects, push } from '_store/actions';
import styles from './projectList.css';
import ProjectItem from './projectItem';

export const ProjectListComponent = ({ children, projects, isNewProject, onNewProject }) => {
  const addProjectHandler = ev => isPlainClick(ev) && onNewProject();
  return (
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
          <button
            className={styles.addProjectButton}
            disabled={isNewProject}
            onClick={addProjectHandler}
          >Add Project</button>
        </div>
      </div>
      {children}
    </div>
  );
};

ProjectListComponent.propTypes = {
  children: PropTypes.node,
  projects: PropTypes.object,
  isNewProject: PropTypes.bool,
  onNewProject: PropTypes.func,
};


export const initialDispatch = (dispatch, nextProps, currentProps, state) => {
  if (isEmpty(state.projects)) {
    return dispatch(getAllProjects());
  }
  return undefined;
};

export const mapStateToProps = (state, params) => ({
  projects: state.projects,
  isNewProject: params.location.pathname.indexOf('/newProject') !== -1,
});

export const mapDispatchToProps = dispatch => ({
  onNewProject: () => dispatch(push('/projects/newProject')),
});

export default initialDispatcher(initialDispatch)(connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectListComponent));
