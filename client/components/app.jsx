import React, { PropTypes } from 'react';

import Errors from '_components/errors';
import Loading from '_components/loading';
import Menu from '_components/menu';

const App = ({ children }) => (
  <div className="app">
    <Loading />
    <Errors />
    <Menu
      menuItems={{
        projects: 'Projects',
      }}
    />
    {children}
  </div>
);

App.propTypes = {
  children: PropTypes.node,
};

export default App;
