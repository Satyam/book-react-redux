import {
  requestSent,
  replyReceived,
  failureReceived,
} from 'store/requests';

const operationRegExp = /\/([A-Z_]+)$/;

export default ({ dispatch }) => next => action => {
  const match = operationRegExp.exec(action.type);
  switch (match && match[1]) {
    case 'REQUEST':
      dispatch(requestSent());
      break;
    case 'SUCCESS':
      dispatch(replyReceived());
      break;
    case 'FAILURE':
      dispatch(failureReceived(action));
      break;
    default:
      break;
  }
  return next(action);
};
