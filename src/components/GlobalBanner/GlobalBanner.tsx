// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from 'antd';

import { Button } from '../Button';
import styles from './GlobalBanner.module.css';

interface GlobalBannerProps {
  title: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  navigationLink?: string;
  navigationText?: string;
}

export const GlobalBanner: React.FC<GlobalBannerProps> = ({ title, subTitle, navigationLink, navigationText }) => {
  const [show, setShow] = React.useState(true);

  if (!show) return null;
  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <img src="/static/rocket.svg" alt="rocket" />
        <div className={styles.text}>
          <Typography.Text className={styles.title}>{title}</Typography.Text>
          {subTitle && <Typography.Text className={styles.subTitle}>{subTitle}</Typography.Text>}
        </div>
      </div>
      <div className={styles.right}>
        {navigationLink && (
          <Button href={navigationLink} target="_blank" type="default">
            {navigationText || 'Learn How to Participate'}
          </Button>
        )}

        <div className={styles.closeButton} onClick={() => setShow(false)}>
          <img src="/static/x.svg" alt="close icon" />
          {/* // todo: if user closes banner, dont show it again on refresh? */}
        </div>
      </div>
    </div>
  );
};
