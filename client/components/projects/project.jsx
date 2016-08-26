import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import isPlainClick from '_utils/isPlainClick';

import initialDispatcher from '_utils/initialDispatcher';
import { deleteProject, getProjectById, push } from '_store/actions';

import TaskList from './taskList';
import styles from './project.css';

export const ProjectComponent = ({ pid, name, descr, onEditClick, onDeleteClick }) => {
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
          <button
            className={styles.deleteButton}
            onClick={deleteClickHandler}
          >Delete Project</button>
        </div>
      </div>
      <TaskList
        pid={pid}
      />
    </div>)
    : (<p>Project {pid} not found</p>)
  ;
};

ProjectComponent.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string,
  descr: PropTypes.string,
  onEditClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
};


export const mapStateToProps = (state, props) => {
  const pid = props.params.pid;
  return state.projects[pid] || {
    pid,
    name: '',
    descr: '',
  };
};

export const mapDispatchToProps = dispatch => ({
  onEditClick: ({ pid }) => dispatch(push(`/projects/editProject/${pid}`)),
  onDeleteClick: ({ pid }) =>
    dispatch(deleteProject(pid))
      .then(() => dispatch(push('/projects'))),
});

export const initialDispatch = (dispatch, nextProps, currentProps, state) => {
  const pid = nextProps.params.pid;
  if (pid) {
    const prj = state.projects[pid];
    if (!prj || !prj.tids) {
      return dispatch(getProjectById(pid));
    }
  }
  return undefined;
};

export default initialDispatcher(initialDispatch)(connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectComponent));
