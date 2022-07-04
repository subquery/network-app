// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import styles from './BannerTestnet.module.css';
import { Button } from '../Button';

export const BannerTestnet = () => {
  const [show, setShow] = useState(true);

  if (!show) return null;
  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <div className={styles.left}>
          <img src="/static/rocket.svg" alt="rocket" />
          <div className={styles.text}>
            {/* // todo: make text the correct design size */}
            <b>Season 3 Frontier Testnet has started 🔥</b>
            <p>Duration: 16/02/2022 - 23/02/2022</p>
          </div>
        </div>
        <div className={styles.right}>
          <Button
            // todo: add link:
            // href={}
            target="_blank"
            type="default"
            // ! trying to apply correct text color through css?
            // className={styles.button}
            // ? can you do inline css variables?
            // style={{ color: var('--sq-primary-blue')}}
          >
            Learn How to Participate
          </Button>
          <div className={styles.closeButton} onClick={() => setShow(false)}>
            <img src="/static/x.svg" alt="close icon" />
          </div>
        </div>
      </div>
    </div>
  );
};
