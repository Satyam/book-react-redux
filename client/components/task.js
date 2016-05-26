import React, { PropTypes, Component } from 'react';
import { completedChanged } from '../store/actions.js';
import { store } from '../store';

class Task extends Component {
  constructor(props) {
    super(props);
    this.state = this.getTask();
    this.onClickHandler = this.onClickHandler.bind(this);
  }
  componentDidMount() {
    this.unsubscriber = store.subscribe(() => this.setState(this.getTask()));
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
    store.dispatch(completedChanged(this.props.pid, this.props.tid, !this.state.completed));
  }
  getTask() {
    return store.getState().projects[this.props.pid].tasks[this.props.tid];
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
