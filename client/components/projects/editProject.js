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
  onChangeHandler(ev) {
    const target = ev.target;
    this.setState({ [target.name]: target.value });
  }
  onSubmitHandler(ev) {
    if (isPlainClick(ev)) this.props.onSubmit(this.state);
  }
  onCancelHandler(ev) {
    if (isPlainClick(ev)) this.props.onCancelEdit();
  }
  render() {
    return (
      <div className={classNames('edit-project', styles.editProject)}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            className={styles.formControl}
            name="name"
            onChange={this.onChangeHandler}
            value={this.state.name}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="descr">Description</label>
          <textarea
            className={styles.formControl}
            name="descr"
            onChange={this.onChangeHandler}
            value={this.state.descr}
          />
        </div>
        <button
          className={styles.okButton}
          disabled={this.state.name.length === 0}
          onClick={this.onSubmitHandler}
        >Ok</button>
        <button
          className={styles.cancelButton}
          onClick={this.onCancelHandler}
        >Cancel</button>
      </div>
    );
  }
}

EditProject.propTypes = {
  pid: PropTypes.string,
  name: PropTypes.string,
  descr: PropTypes.string,
  onSubmit: PropTypes.func,
  onCancelEdit: PropTypes.func,
};

import { addProject, updateProject, push, replace } from 'store/actions';

import { mapStateToProps, initialDispatch } from './project';

export const mapDispatchToProps = (dispatch, { params: { pid } }) => ({
  onSubmit: ({ name, descr }) => {
    if (pid) {
      return dispatch(updateProject(pid, name, descr))
        .then(() => dispatch(push(`/projects/${pid}`)));
    }
    return dispatch(addProject(name, descr))
      .then(response => dispatch(push(`/projects/${response.data.pid}`)));
  },
  onCancelEdit: () => {
    dispatch(replace(
      pid
      ? `/projects/${pid}`
      : '/projects'
    ));
  },
});

import initialDispatcher from 'utils/initialDispatcher.js';

import { connect } from 'react-redux';

export default initialDispatcher(initialDispatch)(connect(
  mapStateToProps,
  mapDispatchToProps
)(EditProject));
