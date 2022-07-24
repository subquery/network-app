// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { message } from 'antd';
import { BsClipboard, BsCheckLg } from 'react-icons/bs';
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
};

const Copy: React.FC<Props> = ({ value, className, iconClassName, children, iconSize }) => {
  const [icon, setIcon] = React.useState<boolean>(false);

  const handleClick = () => {
    setIcon(true);
    if (value) {
      navigator.clipboard.writeText(value);
      sendSuccessMsg('Copied!');
    }
    setTimeout(() => setIcon(false), 500);
  };

  return (
    <div className="flex-center" onClick={handleClick}>
      <div>{children}</div>
      <div className={clsx(styles.container, className)}>
        <div className={clsx(styles.copy, iconClassName)}>
          {icon ? <BsCheckLg size={iconSize ?? 10} /> : <BsClipboard size={iconSize ?? 10} />}
        </div>
      </div>
    </div>
  );
};

export default Copy;
