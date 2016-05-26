import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import { store } from '../store';

class ProjectItem extends Component {
  constructor(props) {
    super(props);
    this.state = this.getProject();
  }
  componentDidMount() {
    this.unsubscriber = store.subscribe(() => this.setState(this.getProject()));
  }
  shouldComponentUpdate(nextProps, nextState) {
    const s = this.state;
    return s.name !== nextState.name || s.pending !== nextState.pending;
  }
  componentWillUnmount() {
    this.unsubscriber();
  }
  getProject() {
    return store.getState().projects[this.props.pid];
  }
  render() {
    const prj = this.state;
    return (
      <li className={`project-item ${this.props.active ? 'selected' : ''}`}>
        {
         this.props.active
         ? prj.name
         : (<Link to={`/project/${this.props.pid}`}>{prj.name}</Link>)
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
