import React, { PropTypes } from 'react';
import { Link, withRouter } from 'react-router';
import map from 'lodash/map';
import styles from './menu.css';

export const MenuComponent = ({ router }) => (
  <ul className={styles.tabs}>
    {
      map(
        {
          projects: 'Projects',
        },
        (caption, path) => (
          router.isActive(path)
          ? (
            <li key={path} className={styles.active}>
              <a>{caption}</a>
            </li>
          )
          : (<li key={path}><Link to={path}>{caption}</Link></li>)
        )
      )
    }
  </ul>
);

MenuComponent.propTypes = {
  router: PropTypes.object,
};

export default withRouter(MenuComponent);
