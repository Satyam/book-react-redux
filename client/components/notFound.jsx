import React, { PropTypes } from 'react'; // eslint-disable-line no-unused-vars

const NotFound = props => (
  <div>
    <h1>Not found</h1>
    <p>Path: <code>{props.location.pathname}</code></p>
  </div>
);

NotFound.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

export default NotFound;
