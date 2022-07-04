// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from 'react';
import styles from './BannerTestnet.module.css';
import { Button } from '../Button';

export const BannerTestnet: FC = () => {
  const [show, setShow] = useState(true);

  if (!show) return null;
  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <div className={styles.left}>
          <img src="/static/rocket.svg" alt="rocket" />
          <div className={styles.text}>
            <div className={styles.title}>Season 3 Frontier Testnet has started 🔥</div>
            <div className={styles.date}>Duration: 16/02/2022 - 23/02/2022</div>
          </div>
        </div>
        <div className={styles.right}>
          <Button
            // todo: add link:
            // href={}
            target="_blank"
            type="default"
          >
            Learn How to Participate
          </Button>
          <div className={styles.closeButton} onClick={() => setShow(false)}>
            <img src="/static/x.svg" alt="close icon" />
            {/* // todo: if user closes banner, dont show it again on refresh? */}
          </div>
        </div>
      </div>
    </div>
  );
};
