import * as React from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header: React.VFC = () => {
  const renderLink = (to: string, text: string) => {
    return (
      <NavLink to={to} className={styles.navLink} activeClassName={styles.navLinkCurrent}>
        {text}
      </NavLink>
    );
  };

  return (
    <div className={styles.header}>
      <Link to="/">
        <img src="/static/logo.png" className={styles.logo} />
      </Link>
      {renderLink('/explorer', 'Explorer')}
      {renderLink('/studio', 'Studio')}
    </div>
  );
};

export default Header;
