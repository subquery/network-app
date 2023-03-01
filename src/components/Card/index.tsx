// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Card.module.css';
import { Card as SQCard, CardProp as SQCardPorps } from '@subql/components';

export const Card: React.FC<SQCardPorps> = (props) => {
  return (
    <SQCard
      className={styles.sqCard}
      description={props.description}
      titleTooltipIcon={props.titleTooltipIcon}
      title={props.title}
    ></SQCard>
  );
};
