const NAME = 'requests/';

export const CLEAR_HTTP_ERRORS = `${NAME} Clear HTTP errors`;
export const REQUEST_SENT = `${NAME} HTTP request sent`;
export const REPLY_RECEIVED = `${NAME} HTTP reply received`;
export const FAILURE_RECEIVED = `${NAME} HTTP failure received`;

export function clearHttpErrors() {
  return { type: CLEAR_HTTP_ERRORS };
}
