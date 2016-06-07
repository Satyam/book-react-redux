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
