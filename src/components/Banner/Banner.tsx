// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import styles from './Banner.module.css';

type Props = {
  text: string;
};

const Banner: React.FC<Props> = ({ text }) => {
  return (
    <div className={styles.container}>
      <span>{text}</span>
    </div>
  );
};

export default Banner;
