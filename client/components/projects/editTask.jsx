import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import bindHandlers from '_utils/bindHandlers';
import isPlainClick from '_utils/isPlainClick';
import classNames from 'classnames';
import pick from 'lodash/pick';

import { updateTask, addTaskToProject, setEditTid } from '_store/actions';
import { mapStateToProps } from './task';
import styles from './editTask.css';

export class EditTaskComponent extends Component {
  constructor(props) {
    super(props);
    this.state = pick(props, 'descr', 'completed');
    bindHandlers(this);
  }
  onChangeHandler(ev) {
    this.setState({ descr: ev.target.value });
  }
  onSubmitHandler(ev) {
    if (isPlainClick(ev)) {
      this.props.onSubmit(this.state)
      .then(() => {
        if (!this.props.tid) this.setState({ descr: '' });
      });
    }
  }
  onCancelHandler(ev) {
    if (isPlainClick(ev)) this.props.onCancelEdit(this.state);
  }
  render() {
    const edit = !!this.props.tid;
    return (
      <div
        className={
          edit
          ? classNames('edit-task', styles.editTask)
          : classNames('add-task', styles.addTask)
        }
      >
        <div className="row">
          <div className="col-xs-7">
            <div className={styles.formGroup}>
              <input
                className={styles.formControl}
                name="descr"
                onChange={this.onChangeHandler}
                value={this.state.descr}
              />
            </div>
          </div>
          <div className="col-xs-5">
            <button
              className={edit ? styles.editButton : styles.addButton}
              disabled={this.state.descr.length === 0}
              onClick={this.onSubmitHandler}
            />
            <button
              className={styles.cancelButton}
              onClick={this.onCancelHandler}
            />
          </div>
        </div>
      </div>
    );
  }
}

EditTaskComponent.propTypes = {
  pid: PropTypes.string,
  tid: PropTypes.string,
  descr: PropTypes.string,
  completed: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancelEdit: PropTypes.func,
};

export const mapDispatchToProps = (dispatch, { pid, tid }) => ({
  onSubmit: ({ descr, completed }) => {
    if (tid) {
      return dispatch(updateTask(pid, tid, descr, completed))
        .then(() => dispatch(setEditTid(null)));
    }
    return dispatch(addTaskToProject(pid, descr, completed));
  },
  onCancelEdit: () => dispatch(setEditTid(null)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditTaskComponent);
