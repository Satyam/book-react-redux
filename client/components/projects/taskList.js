import React, { PropTypes } from 'react';
import Task from './task';
import EditTask from './editTask.js';

export const TaskList = ({ pid, tids, editTid }) => (
  <div className="task-list">{
    tids
    ? tids.map(tid => (
      tid === editTid
        ? <EditTask
          key={tid}
          pid={pid}
          tid={tid}
        />
      : <Task
        key={tid}
        tid={tid}
        pid={pid}
      />)
    )
    : null}
    {editTid ? null : <EditTask pid={pid} />}
  </div>
);

TaskList.propTypes = {
  pid: PropTypes.string,
  tids: PropTypes.arrayOf(PropTypes.string),
  editTid: React.PropTypes.string,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => ({
  tids: state.projects[props.pid].tids,
  editTid: state.misc.editTid,
});

export default connect(
  mapStateToProps
)(TaskList);
