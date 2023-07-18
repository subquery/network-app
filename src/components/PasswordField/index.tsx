// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from 'react';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import Copy from '@components/Copy';

import styles from './index.module.less';

interface IProps {
  password: string;
}

const PasswordField: FC<IProps> = ({ password }) => {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <Copy value={password} position="flex-start">
      <div className={styles.passwordField}>
        <input
          className={styles.passwordFieldInput}
          value={password}
          disabled
          type={showPwd ? 'text' : 'password'}
        ></input>
        <div
          className={styles.passwordFieldEye}
          onClick={(e) => {
            e.stopPropagation();
            setShowPwd(!showPwd);
          }}
        >
          {showPwd ? <BsEye></BsEye> : <BsEyeSlash></BsEyeSlash>}
        </div>
      </div>
    </Copy>
  );
};
export default PasswordField;
