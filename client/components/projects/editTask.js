import React, { Component, PropTypes } from 'react';
import bindHandlers from 'utils/bindHandlers.js';
import isPlainClick from 'utils/isPlainClick.js';

import pick from 'lodash/pick';

export class EditTask extends Component {
  constructor(props) {
    super(props);
    this.state = pick(props, 'pid', 'tid', 'descr', 'completed');
    bindHandlers(this);
  }
  onChangeHandler(ev) {
    this.setState({ descr: ev.target.value });
  }
  onSubmitHandler(ev) {
    ev.preventDefault();
    const st = this.state;
    this.props.onSubmit(st)
    .then(() => {
      if (! st.tid) this.setState({ descr: '' });
    });
  }
  render() {
    return (
      <div
        className={
          this.state.tid
          ? 'edit-task'
          : 'add-task'
        }
      >
        <form className="row" onSubmit={this.onSubmitHandler}>
          <div className="col-xs-7">
            <div className="form-group">
              <input
                className="form-control"
                name="descr"
                onChange={this.onChangeHandler}
                value={this.state.descr}
              />
            </div>
          </div>
          <div className="col-xs-5">
            <button className="btn btn-primary" type="submit">
              <span
                className={`glyphicon glyphicon-${this.state.tid ? 'ok' : 'plus'}`}
              >
              </span>
            </button>
            {this.state.tid
              ? (
              <button className="btn btn-default" type="button" onClick={this.props.onCancel}>
                <span className="glyphicon glyphicon-remove"></span>
              </button>)
              : null
            }
          </div>
        </form>
      </div>
    );
  }
}

EditTask.propTypes = {
  pid: PropTypes.string,
  tid: PropTypes.string,
  descr: PropTypes.string,
  completed: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, { pid, tid }) => ({
  pid,
  tid,
  descr:
    tid
    ? state.tasks[tid].descr
    : '',
  completed:
    tid
    ? state.tasks[tid].completed
    : false,
});

import { updateTask, addTaskToProject, setEditTid } from 'store/actions';

export const mapDispatchToProps = (dispatch) => ({
  onSubmit: ({ pid, tid, descr, completed }) => {
    if (tid) {
      return dispatch(updateTask(pid, tid, descr, completed))
        .then(() => dispatch(setEditTid(null)));
    }
    return dispatch(addTaskToProject(pid, descr, completed));
  },
  onCancel: ev => isPlainClick(ev) && dispatch(setEditTid(null)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditTask);
