import React, { PropTypes } from 'react';

import styles from './projectList.css';

import ProjectItem from './projectItem';

export const ProjectList = ({ children, projects }) => (
  <div className={`project-list ${styles.projectList}`}>
    <h1>Projects:</h1>
    <ul>{
      Object.keys(projects).map(pid =>
        (<ProjectItem
          key={pid}
          pid={pid}
        />)
      )
    }</ul>
    {children}
  </div>
);

ProjectList.propTypes = {
  children: PropTypes.node,
  projects: PropTypes.object,
};

import initialDispatcher from 'utils/initialDispatcher.js';
import { getAllProjects } from 'store/actions';
import isEmpty from 'lodash/isEmpty';

export const initialDispatch = (dispatch, nextProps, currentProps, state) => {
  if (isEmpty(state.projects)) {
    dispatch(getAllProjects());
  }
};
import { connect } from 'react-redux';

export const mapStateToProps = state => ({
  projects: state.projects,
});

export default initialDispatcher(initialDispatch)(connect(
  mapStateToProps
)(ProjectList));
