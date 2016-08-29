export class HttpError extends Error {
  constructor(baseActionType, error) {
    super(error.response ? error.response.data : error.message);
    this.status = error.response ? error.response.status : error.code;
    this.url = error.config.url;
    this.action = baseActionType;
  }
  toString() {
    return `${this.action}: ${this.url}: (${this.status}) - ${this.msg}`;
  }
}

export default (type, asyncRequest, payload = {}) =>
  dispatch => {
    dispatch({
      type,
      payload,
      meta: { request: true },
    });
    return asyncRequest.then(
      response => dispatch({
        type,
        payload: Array.isArray(response.data)
          ? response.data
          : Object.assign({}, payload, response.data),
      }),
      error => dispatch({
        type,
        payload: new HttpError(type, error),
        error: true,
      })
    );
  };
