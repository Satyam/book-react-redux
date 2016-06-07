import update from 'react-addons-update';

const NAME = 'requests/';

export const CLEAR_HTTP_ERRORS = `${NAME} Clear HTTP errors`;
export const REQUEST_SENT = `${NAME} HTTP request sent`;
export const REPLY_RECEIVED = `${NAME} HTTP reply received`;
export const FAILURE_RECEIVED = `${NAME} HTTP failure received`;

export function clearHttpErrors() {
  return { type: CLEAR_HTTP_ERRORS };
}

export function requestSent() {
  return { type: REQUEST_SENT };
}

export function replyReceived() {
  return { type: REPLY_RECEIVED };
}

export function failureReceived({ status, msg, url }) {
  return {
    type: FAILURE_RECEIVED,
    status,
    msg,
    url,
  };
}

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
