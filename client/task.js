import React, { PropTypes, Component } from 'react';
import { TASK_COMPLETED_CHANGE } from './actions.js';
import store from './store.js';

class Task extends Component {
  constructor(props) {
    super(props);
    this.onClickHandler = this.onClickHandler.bind(this);
  }
  componentDidMount() {
    this.unsubscriber = store.subscribe(() => this.forceUpdate());
  }
  componentWillUnmount() {
    this.unsubscriber();
  }
  onClickHandler(ev) {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault();
    const completed = !store.getState()[this.props.pid].tasks[this.props.tid].completed;
    store.dispatch({
      type: TASK_COMPLETED_CHANGE,
      pid: this.props.pid,
      tid: this.props.tid,
      completed,
    });
  }
  render() {
    const task = store.getState()[this.props.pid].tasks[this.props.tid];
    return (
      <li
        onClick={this.onClickHandler}
        className={`task ${task.completed ? 'completed' : 'pending'}`}
      >
        {task.descr}
      </li>
    );
  }
}

Task.propTypes = {
  tid: PropTypes.string,
  pid: PropTypes.string,
};

export default Task;
