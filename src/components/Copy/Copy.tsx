// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { AiFillCheckCircle } from 'react-icons/ai';
import { BsCheckLg, BsClipboard } from 'react-icons/bs';
import { message } from 'antd';
import clsx from 'clsx';

import styles from './Copy.module.css';

const sendSuccessMsg = (msg: string, className?: string) => {
  message.success({
    content: msg,
    className,
  });
};

type Props = {
  value?: string;
  className?: string;
  iconClassName?: string;
  iconSize?: number;
  customIcon?: React.ReactNode;
  children?: React.ReactNode;
  position?: 'flex-start' | 'flex-center';
};

const Copy: React.FC<Props> = ({
  value,
  className,
  iconClassName,
  customIcon,
  children,
  iconSize,
  position = 'flex-center',
}) => {
  const [icon, setIcon] = React.useState<boolean>(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    setIcon(true);
    if (value) {
      navigator.clipboard.writeText(value);
      sendSuccessMsg('Copied!');
    }
    setTimeout(() => setIcon(false), 500);
  };

  return (
    <div className={position} onClick={(e) => handleClick(e)} style={{ alignItems: 'center' }}>
      {children}
      {customIcon ? (
        icon ? (
          <AiFillCheckCircle style={{ color: 'var(--sq-blue400)' }} />
        ) : (
          customIcon
        )
      ) : (
        <div className={clsx(styles.container, className)}>
          <div className={clsx(styles.copy, iconClassName)}>
            {icon ? <BsCheckLg size={iconSize ?? 10} /> : <BsClipboard size={iconSize ?? 10} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Copy;
