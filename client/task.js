import React, { PropTypes, Component } from 'react';
import { TASK_COMPLETED_CHANGE } from './actions.js';
import store from './store.js';

class Task extends Component {
  constructor(props) {
    super(props);
    this.state = this.getTask();
    this.onClickHandler = this.onClickHandler.bind(this);
  }
  componentDidMount() {
    this.unsubscriber = store.subscribe(this.update.bind(this));
  }
  shouldComponentUpdate(nextProps, nextState) {
    const s = this.state;
    return s.descr !== nextState.descr || s.completed !== nextState.completed;
  }
  componentWillUnmount() {
    this.unsubscriber();
  }
  onClickHandler(ev) {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault();
    store.dispatch({
      type: TASK_COMPLETED_CHANGE,
      pid: this.props.pid,
      tid: this.props.tid,
      completed: !this.state.completed,
    });
  }
  getTask() {
    return store.getState()[this.props.pid].tasks[this.props.tid];
  }
  update() {
    this.setState(this.getTask());
  }
  render() {
    const task = this.state;
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
