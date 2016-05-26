export const TASK_COMPLETED_CHANGE = 'projects/Task completed changed';

export const completedChanged = (pid, tid, completed) => ({
  type: TASK_COMPLETED_CHANGE,
  pid,
  tid,
  completed,
});
