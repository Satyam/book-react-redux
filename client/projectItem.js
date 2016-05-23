import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import store from './store.js';

class ProjectItem extends Component {
  componentDidMount() {
    this.unsubscriber = store.subscribe(() => this.forceUpdate());
  }
  componentWillUnmount() {
    this.unsubscriber();
  }
  render() {
    const pid = this.props.pid;
    const prj = store.getState()[pid];
    return (
      <li className={`project-item ${this.props.active ? 'selected' : ''}`}>
        {
         this.props.active
         ? prj.name
         : (<Link to={`/project/${pid}`}>{prj.name}</Link>)
       } [Pending: {prj.pending}]
      </li>
    );
  }
}

ProjectItem.propTypes = {
  pid: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

export default ProjectItem;
