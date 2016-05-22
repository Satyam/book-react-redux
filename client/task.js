import React, { PropTypes, Component } from 'react';

class Task extends Component {
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

export default Task;
