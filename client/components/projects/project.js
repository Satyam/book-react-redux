import React, { PropTypes } from 'react';
import TaskList from './taskList';
import styles from './project.css';
import classNames from 'classnames';
import isPlainClick from 'utils/isPlainClick';

export const Project = ({ pid, name, descr, onEditClick, onDeleteClick }) => {
  const editClickHandler = ev => isPlainClick(ev) && onEditClick({ pid });
  const deleteClickHandler = ev =>
    isPlainClick(ev) &&
    window.confirm('Are you sure?') && // eslint-disable-line no-alert
    onDeleteClick({ pid });
  return name
    ? (
    <div className={classNames('project', styles.project)}>
      <div className="row">
        <div className="col-md-9">
          <h1>{name}</h1>
          <div className={styles.descr}>{descr}</div>
        </div>
        <div className="col-md-3">
          <button className={styles.editButton} onClick={editClickHandler}>Edit Project</button>
          <button className={styles.deleteButton} onClick={deleteClickHandler}>Delete Project</button>
        </div>
      </div>
      <TaskList
        pid={pid}
      />
    </div>)
    : (<p>Project {pid} not found</p>)
  ;
};

Project.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string,
  descr: PropTypes.string,
  onEditClick: PropTypes.func,
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

export const mapDispatchToProps = dispatch => ({
  onEditClick: ({ pid }) => dispatch(push(`/projects/editProject/${pid}`)),
  onDeleteClick: ({ pid }) =>
    dispatch(deleteProject(pid))
      .then(() => dispatch(push('/projects'))),
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
