import React, { PropTypes, Component } from 'react';
const data = require('./data.js');

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
    this.props.onCompletedChange({
      tid: this.props.tid,
      completed: !this.state.completed,
    });
    this.setState({ completed: !this.state.completed });
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

export const TaskList = ({ pid, tasks, onCompletedChange }) => {
  const onCompletedChangeHandler = ev => onCompletedChange(Object.assign(ev, { pid }));
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
  onCompletedChange: PropTypes.func,
};

const Project = ({ params: { pid } }) => {
  const onCompletedChangeHandler = ev => {
    data[ev.pid].tasks[ev.tid].completed = ev.completed;
  };
  const prj = data[pid];
  return (<div className="project">
    <h1>{prj.name}</h1>
    <p>{prj.descr}</p>
    <TaskList pid={pid} tasks={prj.tasks} onCompletedChange={onCompletedChangeHandler} />
  </div>);
};

Project.propTypes = {
  params: PropTypes.shape({
    pid: PropTypes.string.isRequired,
  }),
};

export default Project;
