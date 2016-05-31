import React, { PropTypes } from 'react';

import ProjectItem from './projectItem';

export const ProjectList = ({ children, projects }) => (
  <div className="project-list">
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

import { connect } from 'react-redux';

export const mapStateToProps = state => ({
  projects: state.projects,
});

export default connect(
  mapStateToProps
)(ProjectList);
