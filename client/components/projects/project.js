import React, { PropTypes } from 'react';
import TaskList from './taskList';
import styles from './project.css';
import classNames from 'classnames';
import { Link } from 'react-router';
import isPlainClick from 'utils/isPlainClick';

export const Project = ({ pid, name, descr, onDeleteClick }) => (
  name
  ? (
    <div className={classNames('project', styles.project)}>
      <div className="row">
        <div className="col-md-9">
          <h1>{name}</h1>
          <div className={styles.descr}>{descr}</div>
        </div>
        <div className="col-md-3">
          <Link className="btn btn-default" to={`/projects/editProject/${pid}`}>Edit Project</Link>
          <button className="btn btn-warning" onClick={onDeleteClick}>Delete Project</button>
        </div>
      </div>
      <TaskList
        pid={pid}
      />
    </div>)
  : (<p>Project {pid} not found</p>)
);

Project.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string,
  descr: PropTypes.string,
  onDeleteClick: PropTypes.func,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => {
  const pid = props.params.pid;
  const project = state.projects[pid];
  return {
    pid,
    name: project && project.name,
    descr: project && project.descr,
  };
};

import { deleteProject, getProjectById, push } from 'store/actions';

export const mapDispatchToProps = (dispatch, props) => ({
  onDeleteClick: ev => {
    if (isPlainClick(ev) && window.confirm('Are you sure?')) { // eslint-disable-line no-alert
      return dispatch(deleteProject(props.params.pid))
        .then(() => dispatch(push('/projects')));
    }
    return undefined;
  },
});

import initialDispatcher from 'utils/initialDispatcher.js';

export const initialDispatch = (dispatch, nextProps, currentProps, state) => {
  const pid = nextProps.params.pid;
  const prj = pid && state.projects[pid];
  if (!prj || !prj.tids) {
    dispatch(getProjectById(pid));
  }
};

export default initialDispatcher(initialDispatch)(connect(
  mapStateToProps,
  mapDispatchToProps
)(Project));
