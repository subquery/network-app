// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@subql/react-ui';
import styles from './Footer.module.css';

const LinkButton: React.VFC<{
  link: string;
  icon?: 'twitter' | 'telegram' | 'github' | 'discord' | 'linkedin' | 'matrix';
  label?: string;
}> = (props) => {
  return (
    <Button
      type="secondary"
      label={props.label}
      href={props.link}
      className={styles.iconButton}
      leftItem={
        props.icon &&
        (props.icon === 'matrix' ? (
          <img src="/static/matrix-logo.svg" className={styles.image} alt="matrix logo" />
        ) : (
          <i className={`bi-${props.icon}`} role="img" aria-label={props.icon} />
        ))
      }
      target="_blank"
      rel="noreferrer"
    />
  );
};

const links: React.ComponentProps<typeof LinkButton>[] = [
  { link: 'https://twitter.com/subquerynetwork', icon: 'twitter' },
  { link: 'https://t.me/subquerynetwork', icon: 'telegram' },
  { link: 'https://github.com/subquery', icon: 'github' },
  { link: 'https://discord.com/invite/78zg8aBSMG', icon: 'discord' },
  { link: 'https://www.linkedin.com/company/subquery', icon: 'linkedin' },
  { link: 'https://matrix.to/#/#subquery:matrix.org', icon: 'matrix' },
  /* TODO replace with icons, bootstrap icons doesn't have support for below*/
  { link: 'https://medium.com/@subquery', label: 'Medium' },
];

const Footer: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div style={{ display: 'flex', flexGrow: 1 }}>
          <Typography variant="h4">{t('footer.title')}</Typography>
        </div>
        <div className={styles.iconsContainer}>
          {links.map((l, i) => (
            <LinkButton {...l} key={i} />
          ))}
        </div>
      </div>
      <div className={styles.bottom}>
        <Typography variant="medium">{`${t('footer.copyright')}${new Date().getFullYear()}`}</Typography>
      </div>
    </div>
  );
};

export default Footer;
