import React, { PropTypes } from 'react';

import ProjectItem from './projectItem.js';

export const ProjectList = ({ children, params, projects }) => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      Object.keys(projects).map(pid =>
        (<ProjectItem
          key={pid}
          pid={pid}
          active={params.pid === pid}
        />)
      )
    }</ul>
    {children}
  </div>
);

ProjectList.propTypes = {
  children: PropTypes.node,
  params: React.PropTypes.shape({
    pid: React.PropTypes.string,
  }),
  projects: PropTypes.object,
};

import { connect } from 'react-redux';

export const mapStateToProps = state => ({
  projects: state.projects,
});

export default connect(
  mapStateToProps
)(ProjectList);
