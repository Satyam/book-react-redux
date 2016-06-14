import React, { Component, PropTypes } from 'react';
import bindHandlers from 'utils/bindHandlers.js';
import isPlainClick from 'utils/isPlainClick.js';
import styles from './editProject.css';
import classNames from 'classnames';
import pick from 'lodash/pick';

export class EditProject extends Component {
  constructor(props) {
    super(props);
    this.state = pick(props, 'name', 'descr');
    bindHandlers(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState(pick(nextProps, 'name', 'descr'));
  }
  onChangeHandler(ev) {
    const target = ev.target;
    this.setState({ [target.name]: target.value });
  }
  onSubmitHandler(ev) {
    ev.preventDefault();
    this.props.onSubmit(this.state);
  }
  onCancelHandler(ev) {
    if (isPlainClick(ev)) this.props.onCancelEdit(this.state);
  }
  render() {
    return (
      <div className={classNames('edit-project', styles.editProject)}>
        <form onSubmit={this.onSubmitHandler}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              className="form-control"
              name="name"
              onChange={this.onChangeHandler}
              value={this.state.name}
            />
          </div>
          <div className="form-group">
            <label htmlFor="descr">Description</label>
            <textarea
              className="form-control"
              name="descr"
              onChange={this.onChangeHandler}
              value={this.state.descr}
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={this.state.name.length === 0}
          >Ok</button>
          <button
            className="btn btn-default"
            type="button"
            onClick={this.onCancelHandler}
          >Cancel</button>
        </form>
      </div>
    );
  }
}

EditProject.propTypes = {
  name: PropTypes.string,
  descr: PropTypes.string,
  onSubmit: PropTypes.func,
  onCancelEdit: PropTypes.func,
};

import { getProjectById, addProject, updateProject, push, replace } from 'store/actions';

export const mapStateToProps = (state, { params }) => {
  const pid = params.pid;
  const prj = pid && state.projects[pid];
  return prj || {
    name: '',
    descr: '',
  };
};

export const mapDispatchToProps = (dispatch, { params }) => ({
  onSubmit: ({ name, descr }) => {
    const pid = params.pid;
    if (pid) {
      return dispatch(updateProject(pid, name, descr))
        .then(() => dispatch(push(`/projects/${pid}`)));
    }
    return dispatch(addProject(name, descr))
      .then(response => dispatch(push(`/projects/${response.data.pid}`)));
  },
  onCancelEdit: () => {
    const pid = params.pid;
    dispatch(replace(
      pid
      ? `/projects/${pid}`
      : '/projects'
    ));
  },
});

import initialDispatcher from 'utils/initialDispatcher.js';

export const initialDispatch = (dispatch, nextProps, currentProps, state) => {
  const pid = nextProps.params.pid;
  if (!pid) return;
  const prj = pid && state.projects[pid];
  if (!prj || !prj.tids) {
    dispatch(getProjectById(pid));
  }
};

import { connect } from 'react-redux';

export default initialDispatcher(initialDispatch)(connect(
  mapStateToProps,
  mapDispatchToProps
)(EditProject));
