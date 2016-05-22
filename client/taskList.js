import React, { PropTypes, Component } from 'react';

export class Task extends Component {
  constructor(props) {
    super(props);
    this.state = {
      completed: props.completed,
      descr: props.descr,
    };
    this.onClickHandler = this.onClickHandler.bind(this);
  }
  onClickHandler(ev) {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault();
    const completed = !this.state.completed;
    this.props.onCompletedChange({
      tid: this.props.tid,
      completed,
    });
    this.setState({ completed });
  }
  render() {
    return (
      <li
        onClick={this.onClickHandler}
        className={`task ${this.state.completed ? 'completed' : 'pending'}`}
      >
        {this.state.descr}
      </li>
    );
  }
}

Task.propTypes = {
  completed: PropTypes.bool,
  descr: PropTypes.string,
  tid: PropTypes.string,
  onCompletedChange: PropTypes.func,
};

const TaskList = ({ pid, tasks, onTaskCompletedChange }) => {
  const onCompletedChangeHandler = ev => onTaskCompletedChange(Object.assign(ev, { pid }));
  return (<ul className="task-list">{
    Object.keys(tasks).map(tid => {
      const task = tasks[tid];
      return (<Task
        key={tid}
        descr={task.descr}
        completed={task.completed}
        tid={tid}
        onCompletedChange={onCompletedChangeHandler}
      />);
    })
  }</ul>);
};

TaskList.propTypes = {
  pid: PropTypes.string,
  tasks: PropTypes.object,
  onTaskCompletedChange: PropTypes.func,
};

export default TaskList;
