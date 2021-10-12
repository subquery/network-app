// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import Button from '../Button';
import styles from './Footer.module.css';

const LinkButton: React.VFC<{
  link: string;
  icon?: 'twitter' | 'telegram' | 'github' | 'discord' | 'linkedin';
  label?: string;
}> = (props) => {
  return (
    <Button
      type="secondary"
      label={props.label || ''}
      href={props.link}
      className={styles.iconButton}
      leftItem={props.icon && <i className={`bi-${props.icon}`} role="img" aria-label={props.icon} />}
    />
  );
};

const links: React.ComponentProps<typeof LinkButton>[] = [
  { link: 'https://twitter.com/subquerynetwork', icon: 'twitter' },
  { link: 'https://t.me/subquerynetwork', icon: 'telegram' },
  { link: 'https://github.com/subquery', icon: 'github' },
  { link: 'https://discord.com/invite/78zg8aBSMG', icon: 'discord' },
  { link: 'https://www.linkedin.com/company/subquery', icon: 'linkedin' },
  /* TODO replace with icons, bootstrap icons doesn't have support for below*/
  { link: 'https://medium.com/@subquery', label: 'Medium' },
  { link: 'https://matrix.to/#/#subquery:matrix.org', label: 'Matrix' },
];

const Footer: React.VFC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div style={{ display: 'flex', flexGrow: 1 }}>
          <span className={styles.slogan}>Join The Future</span>
        </div>
        <div className={styles.iconsContainer}>
          {links.map((l, i) => (
            <LinkButton {...l} key={i} />
          ))}
        </div>
      </div>
      <div className={styles.bottom}>
        <span className={styles.copyright}>{`SubQuery © ${new Date().getFullYear()}`}</span>
      </div>
    </div>
  );
};

export default Footer;
