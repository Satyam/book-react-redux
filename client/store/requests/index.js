import update from 'react-addons-update';

import {
  CLEAR_HTTP_ERRORS,
  REQUEST_SENT,
  REPLY_RECEIVED,
  FAILURE_RECEIVED,
} from './actions';

export default (state = { pending: 0, errors: [] }, action) => {
  switch (action.type) {
    case CLEAR_HTTP_ERRORS:
      return update(state, { errors: { $set: [] } });
    case REQUEST_SENT:
      return update(state, { pending: { $apply: x => x + 1 } });
    case REPLY_RECEIVED:
      return update(state, { pending: { $apply: x => (x > 0 ? x - 1 : 0) } });
    case FAILURE_RECEIVED:
      return update(
        state,
        {
          pending: { $apply: x => (x > 0 ? x - 1 : 0) },
          errors: { $push: [
            `${action.type.replace('[FAILURE] ', '')}:
            ${action.url}: (${action.status}) - ${action.msg}`,
          ] },
        });
    default:
      return state;
  }
};
