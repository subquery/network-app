// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Button as AntdButton, ButtonProps } from 'antd';

import styles from './Button.module.css';

interface IButtonProps extends ButtonProps {
  children?: React.ReactNode;
  onClick?: (any: any) => void;
}

// custom antD button
export const Button: React.FC<IButtonProps> = ({ children, onClick, ...buttonProps }) => {
  return (
    <AntdButton
      type="primary"
      shape="round"
      size={'large'}
      onClick={onClick}
      {...buttonProps}
      className={buttonProps?.type !== 'text' ? styles.button : ''}
    >
      {children}
    </AntdButton>
  );
};
