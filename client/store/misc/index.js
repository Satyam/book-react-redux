import update from 'react-addons-update';

export const EDIT_TID = 'misc/Set tid of task to be edited';

export function setEditTid(tid) {
  return {
    type: EDIT_TID,
    tid,
  };
}

export default (state = { editTid: null }, action) => {
  switch (action.type) {
    case EDIT_TID:
      return update(state, { editTid: { $set: action.tid } });
    default:
      return state;
  }
};
