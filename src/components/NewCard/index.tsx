// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { Typography } from '@subql/components';
import { Card, Tooltip } from 'antd';
import { isString } from 'lodash-es';

import styles from './index.module.less';

interface IProps {
  title?: React.ReactNode;
  titleExtra?: React.ReactNode;
  tooltip?: React.ReactNode;
  children?: React.ReactNode;
  width?: number;
  style?: React.CSSProperties;
}

// TODO: migrate to components
const NewCard: FC<IProps> = (props) => {
  return (
    <Card
      className={styles.newCard}
      title={
        <div className="col-flex">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isString(props.title) ? <Typography>{props.title}</Typography> : props.title}
            {props.tooltip ? (
              <Tooltip title={props.tooltip}>
                <BsInfoCircle style={{ color: 'var(--sq-gray500)', fontSize: 14, marginLeft: 8 }}></BsInfoCircle>
              </Tooltip>
            ) : (
              ''
            )}
          </div>
          <div style={{ marginTop: 12 }}>{props.titleExtra}</div>
        </div>
      }
      style={{ width: props.width ? `${props.width}px` : 'auto', ...props.style }}
    >
      {props.children && (
        <div
          style={{ width: '100%', height: 1, background: 'var(--sq-gray300)', transform: `translateY(-12px)` }}
        ></div>
      )}
      {props.children}
    </Card>
  );
};
export default NewCard;
