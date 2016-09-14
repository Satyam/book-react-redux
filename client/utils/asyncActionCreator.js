import {
  REQUEST_SENT,
  REPLY_RECEIVED,
  FAILURE_RECEIVED,
} from '_store/requests/actions';

export default (type, asyncRequest, payload = {}) =>
  dispatch => {
    dispatch({
      type,
      payload,
      meta: { asyncAction: REQUEST_SENT },
    });
    return asyncRequest.then(
      response => dispatch({
        type,
        payload: Object.assign(response, payload),
        meta: { asyncAction: REPLY_RECEIVED },
      }),
      error => {
        const err = {
          status: error.status,
          statusText: error.statusText,
          message: error.toString(),
          actionType: type,
          originalPayload: payload,
        };
        return dispatch({
          type,
          payload: err,
          error: true,
          meta: { asyncAction: FAILURE_RECEIVED },
        });
      }
    );
  };
