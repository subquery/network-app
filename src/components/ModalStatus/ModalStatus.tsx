// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Modal as AntDModal } from 'antd';
import { Typography } from '@subql/react-ui';
import { FaCheckSquare, FaWindowClose } from 'react-icons/fa';
import styles from './ModalStatus.module.css';

/**
 * NOTE:
 * Using antd
 * Waiting for SubQuery components lib(also based on antD) release and replace
 */

interface ModalStatusProps {
  visible: boolean;
  title?: string;
  success?: boolean;
  successText?: string;
  error?: boolean;
  errorText?: string;
  onCancel: () => void;
}

export const ModalStatus: React.FC<ModalStatusProps> = ({
  success,
  successText,
  error,
  errorText,
  title,
  visible,
  onCancel,
}) => {
  React.useEffect(() => {
    setTimeout(() => {
      onCancel();
    }, 1000);
  }, []);

  return (
    <AntDModal title={title} visible={visible} onCancel={onCancel} footer={null}>
      <div className={styles.container}>
        {(success || successText) && (
          <div className={styles.status}>
            <FaCheckSquare className={styles.successIcon} size={28} />
            <Typography className={styles.statusText}>{successText || 'Success!'}</Typography>
          </div>
        )}
        {(error || errorText) && (
          <div className={styles.status}>
            <FaWindowClose className={styles.errorIcon} size={28} />
            <Typography className={styles.statusText}>{errorText || 'Error.'}</Typography>
          </div>
        )}
      </div>
    </AntDModal>
  );
};
